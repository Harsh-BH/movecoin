module movecoin_games::game_platform {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_std::table::{Self, Table};
    use aptos_framework::aptos_coin::{AptosCoin};

    /// Errors
    const E_NOT_INITIALIZED: u64 = 0;
    const E_ALREADY_INITIALIZED: u64 = 1;
    const E_NOT_ADMIN: u64 = 2;
    const E_INSUFFICIENT_FUNDS: u64 = 3;
    const E_GAME_NOT_REGISTERED: u64 = 4;
    const E_PLAYER_NOT_REGISTERED: u64 = 5;
    const E_ALREADY_REGISTERED: u64 = 6;
    const E_INVALID_REWARD_THRESHOLD: u64 = 7;
    
    /// Game session duration in seconds (30 minutes)
    const GAME_SESSION_DURATION: u64 = 1800;

    /// Game entry containing configuration for each game
    struct Game has store, drop {
        id: String,
        name: String,
        fee: u64, // in APT (smallest unit)
        active: bool,
        reward_threshold: u64, // Minimum score needed for rewards
        reward_multiplier: u64, // How many tokens per 1000 points above threshold
        total_plays: u64,
        total_rewards_distributed: u64,
    }

    /// Player state for a specific game
    struct PlayerGameState has store {
        high_score: u64,
        total_plays: u64,
        last_play_timestamp: u64,
        total_rewards_earned: u64,
        rank: u64, // Global rank, updated periodically
    }

    /// Player profile resource stored in account storage
    struct PlayerProfile has key {
        games_played: Table<String, PlayerGameState>, // game_id -> player state
        total_spent: u64,
        total_rewards: u64,
    }

    /// Platform state resource
    struct GamePlatform has key {
        admin: address,
        games: Table<String, Game>,
        player_count: u64,
        treasury_balance: u64,
        fee_percentage: u64, // Platform fee as percentage (e.g., 10 = 10%)
    }

    /// Ranking data for a game
    struct GameRankings has key {
        game_id: String,
        rankings: vector<address>, // Top players by score, limited to top 100
    }

    /// Initialize the game platform
    public entry fun initialize(admin: &signer, fee_percentage: u64) {
        let admin_addr = signer::address_of(admin);
        
        assert!(!exists<GamePlatform>(admin_addr), E_ALREADY_INITIALIZED);
        assert!(fee_percentage <= 50, 0); // Fee cannot be more than 50%
        
        let platform = GamePlatform {
            admin: admin_addr,
            games: table::new(),
            player_count: 0,
            treasury_balance: 0,
            fee_percentage,
        };
        
        move_to(admin, platform);
    }

    /// Register a new game
    public entry fun register_game(
        admin: &signer,
        game_id: String,
        name: String,
        fee: u64,
        reward_threshold: u64,
        reward_multiplier: u64
    ) acquires GamePlatform {
        let admin_addr = signer::address_of(admin);
        let platform = borrow_global_mut<GamePlatform>(@movecoin_games);
        
        assert!(admin_addr == platform.admin, E_NOT_ADMIN);
        assert!(!table::contains(&platform.games, game_id), E_ALREADY_REGISTERED);
        assert!(reward_threshold > 0, E_INVALID_REWARD_THRESHOLD);
        
        let game = Game {
            id: game_id,
            name,
            fee,
            active: true,
            reward_threshold,
            reward_multiplier,
            total_plays: 0,
            total_rewards_distributed: 0,
        };
        
        table::add(&mut platform.games, game_id, game);
        
        // Initialize game rankings
        let rankings = GameRankings {
            game_id,
            rankings: vector::empty(),
        };
        
        move_to(admin, rankings);
    }

    /// Register player profile if they don't have one
    public entry fun register_player(player: &signer) {
        let player_addr = signer::address_of(player);
        
        if (!exists<PlayerProfile>(player_addr)) {
            let profile = PlayerProfile {
                games_played: table::new(),
                total_spent: 0,
                total_rewards: 0,
            };
            
            move_to(player, profile);
            
            // Increment player count in platform
            let platform = borrow_global_mut<GamePlatform>(@movecoin_games);
            platform.player_count = platform.player_count + 1;
        }
    }

    /// Play a game by paying the required fee
    public entry fun play_game(
        player: &signer,
        game_id: String
    ) acquires GamePlatform, PlayerProfile {
        let player_addr = signer::address_of(player);
        let platform = borrow_global_mut<GamePlatform>(@movecoin_games);
        
        // Make sure game exists and is active
        assert!(table::contains(&platform.games, game_id), E_GAME_NOT_REGISTERED);
        let game = table::borrow_mut(&mut platform.games, game_id);
        assert!(game.active, E_GAME_NOT_REGISTERED);
        
        // Ensure player is registered
        assert!(exists<PlayerProfile>(player_addr), E_PLAYER_NOT_REGISTERED);
        
        // Calculate the platform fee
        let fee = game.fee;
        let platform_cut = (fee * platform.fee_percentage) / 100;
        let treasury_amount = fee - platform_cut;
        
        // Transfer APT from player to platform
        coin::transfer<AptosCoin>(player, @movecoin_games, fee);
        
        // Update platform state
        platform.treasury_balance = platform.treasury_balance + treasury_amount;
        
        // Update player profile
        let profile = borrow_global_mut<PlayerProfile>(player_addr);
        profile.total_spent = profile.total_spent + fee;
        
        // If player hasn't played this game before, initialize state
        if (!table::contains(&profile.games_played, game_id)) {
            table::add(&mut profile.games_played, game_id, PlayerGameState {
                high_score: 0,
                total_plays: 0,
                last_play_timestamp: 0,
                total_rewards_earned: 0,
                rank: 0,
            });
        }
        
        let player_game_state = table::borrow_mut(&mut profile.games_played, game_id);
        player_game_state.total_plays = player_game_state.total_plays + 1;
        player_game_state.last_play_timestamp = timestamp::now_seconds();
        
        // Update game stats
        game.total_plays = game.total_plays + 1;
    }

    /// Submit score after gameplay and receive rewards if qualified
    public entry fun submit_score(
        player: &signer,
        game_id: String,
        score: u64
    ) acquires GamePlatform, PlayerProfile, GameRankings {
        let player_addr = signer::address_of(player);
        
        // Ensure platform is initialized
        assert!(exists<GamePlatform>(@movecoin_games), E_NOT_INITIALIZED);
        let platform = borrow_global_mut<GamePlatform>(@movecoin_games);
        
        // Make sure game exists
        assert!(table::contains(&platform.games, game_id), E_GAME_NOT_REGISTERED);
        let game = table::borrow_mut(&mut platform.games, game_id);
        
        // Ensure player is registered and has played the game
        assert!(exists<PlayerProfile>(player_addr), E_PLAYER_NOT_REGISTERED);
        let profile = borrow_global_mut<PlayerProfile>(player_addr);
        assert!(table::contains(&profile.games_played, game_id), E_PLAYER_NOT_REGISTERED);
        
        // Get player game state
        let player_game_state = table::borrow_mut(&mut profile.games_played, game_id);
        
        // Verify the player has an active game session
        let current_time = timestamp::now_seconds();
        assert!(
            current_time <= player_game_state.last_play_timestamp + GAME_SESSION_DURATION,
            0 // Session expired
        );
        
        // Update high score if current score is higher
        if (score > player_game_state.high_score) {
            player_game_state.high_score = score;
            
            // Update rankings
            update_rankings(player_addr, game_id, score);
        }
        
        // Calculate rewards if score is above threshold
        if (score > game.reward_threshold) {
            let score_above_threshold = score - game.reward_threshold;
            let reward_amount = (score_above_threshold * game.reward_multiplier) / 1000;
            
            // Cap rewards at treasury balance
            if (reward_amount > platform.treasury_balance) {
                reward_amount = platform.treasury_balance;
            }
            
            if (reward_amount > 0) {
                // Transfer rewards from treasury to player
                coin::transfer<AptosCoin>(&account::create_signer_with_capability(
                    &account::create_test_signer_cap(@movecoin_games)
                ), player_addr, reward_amount);
                
                // Update player reward stats
                player_game_state.total_rewards_earned = 
                    player_game_state.total_rewards_earned + reward_amount;
                profile.total_rewards = profile.total_rewards + reward_amount;
                
                // Update game and platform stats
                game.total_rewards_distributed = 
                    game.total_rewards_distributed + reward_amount;
                platform.treasury_balance = platform.treasury_balance - reward_amount;
            }
        }
    }

    /// Admin function to update game parameters
    public entry fun update_game(
        admin: &signer,
        game_id: String,
        fee: u64,
        active: bool,
        reward_threshold: u64,
        reward_multiplier: u64
    ) acquires GamePlatform {
        let admin_addr = signer::address_of(admin);
        let platform = borrow_global_mut<GamePlatform>(@movecoin_games);
        
        assert!(admin_addr == platform.admin, E_NOT_ADMIN);
        assert!(table::contains(&platform.games, game_id), E_GAME_NOT_REGISTERED);
        
        let game = table::borrow_mut(&mut platform.games, game_id);
        game.fee = fee;
        game.active = active;
        game.reward_threshold = reward_threshold;
        game.reward_multiplier = reward_multiplier;
    }

    /// Update player rankings for a game
    fun update_rankings(player_addr: address, game_id: String, score: u64) 
        acquires GameRankings, PlayerProfile {
        
        let rankings = borrow_global_mut<GameRankings>(@movecoin_games);
        assert!(rankings.game_id == game_id, E_GAME_NOT_REGISTERED);
        
        // Check if player is already in rankings
        let (is_in_rankings, index) = is_player_in_rankings(player_addr, &rankings.rankings);
        
        if (is_in_rankings) {
            // Remove player from current position
            vector::remove(&mut rankings.rankings, index);
        }
        
        // Find the right position to insert player based on score
        let insert_index = find_insert_position(score, game_id, &rankings.rankings);
        vector::insert(&mut rankings.rankings, player_addr, insert_index);
        
        // Keep only top 100 players
        if (vector::length(&rankings.rankings) > 100) {
            vector::pop_back(&mut rankings.rankings);
        }
        
        // Update player rank
        let profile = borrow_global_mut<PlayerProfile>(player_addr);
        let player_game_state = table::borrow_mut(&mut profile.games_played, game_id);
        player_game_state.rank = insert_index + 1; // 1-based ranking
    }

    /// Check if player is already in rankings
    fun is_player_in_rankings(player_addr: address, rankings: &vector<address>): (bool, u64) {
        let len = vector::length(rankings);
        let i = 0;
        
        while (i < len) {
            if (vector::borrow(rankings, i) == &player_addr) {
                return (true, i)
            };
            i = i + 1;
        };
        
        (false, 0)
    }

    /// Find the right position to insert player in rankings based on score
    fun find_insert_position(score: u64, game_id: String, rankings: &vector<address>): u64 {
        let len = vector::length(rankings);
        let i = 0;
        
        while (i < len) {
            let addr = *vector::borrow(rankings, i);
            let profile = borrow_global<PlayerProfile>(addr);
            let player_game_state = table::borrow(&profile.games_played, game_id);
            
            if (score > player_game_state.high_score) {
                return i
            };
            
            i = i + 1;
        };
        
        i
    }

    /// Get player's high score for a game
    public fun get_high_score(player_addr: address, game_id: String): u64 
        acquires PlayerProfile {
        
        if (!exists<PlayerProfile>(player_addr)) {
            return 0
        };
        
        let profile = borrow_global<PlayerProfile>(player_addr);
        
        if (!table::contains(&profile.games_played, game_id)) {
            return 0
        };
        
        let player_game_state = table::borrow(&profile.games_played, game_id);
        player_game_state.high_score
    }

    /// Get player's rank for a game
    public fun get_rank(player_addr: address, game_id: String): u64 
        acquires PlayerProfile {
        
        if (!exists<PlayerProfile>(player_addr)) {
            return 0
        };
        
        let profile = borrow_global<PlayerProfile>(player_addr);
        
        if (!table::contains(&profile.games_played, game_id)) {
            return 0
        };
        
        let player_game_state = table::borrow(&profile.games_played, game_id);
        player_game_state.rank
    }

    /// Get game fee
    public fun get_game_fee(game_id: String): u64 
        acquires GamePlatform {
        
        let platform = borrow_global<GamePlatform>(@movecoin_games);
        
        if (!table::contains(&platform.games, game_id)) {
            return 0
        };
        
        let game = table::borrow(&platform.games, game_id);
        game.fee
    }

    /// Admin function to withdraw platform fees
    public entry fun withdraw_platform_fees(
        admin: &signer,
        amount: u64
    ) acquires GamePlatform {
        let admin_addr = signer::address_of(admin);
        let platform = borrow_global_mut<GamePlatform>(@movecoin_games);
        
        assert!(admin_addr == platform.admin, E_NOT_ADMIN);
        assert!(amount <= platform.treasury_balance, E_INSUFFICIENT_FUNDS);
        
        // Transfer APT from platform to admin
        coin::transfer<AptosCoin>(
            &account::create_signer_with_capability(&account::create_test_signer_cap(@movecoin_games)),
            admin_addr,
            amount
        );
        
        platform.treasury_balance = platform.treasury_balance - amount;
    }
}