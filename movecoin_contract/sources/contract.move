module 0xDEADBEEF::GameScore {
    use 0x1::signer;
    use 0x1::vector;
    use 0x1::coin;
    use 0x1::aptos_coin::AptosCoin;
    use 0x1::aptos_account;
    use 0x1::event;

    /// Error codes for the game contract.
    const E_GAME_ALREADY_REGISTERED: u64 = 0;
    const E_GAME_NOT_ACTIVE: u64 = 1;
    const E_NOT_GAME_OWNER: u64 = 2;
    const E_ALREADY_SUBMITTED: u64 = 3;
    const E_NO_PLAYERS: u64 = 4;
    const E_COIN_STORE_NOT_REGISTERED: u64 = 5;

    /// Event emitted when a player submits a score.
    #[event]
    struct ScoreSubmittedEvent has drop, store {
        player: address,
        score: u64,
    }

    /// Event emitted when the game reward is distributed to a winner.
    #[event]
    struct RewardDistributedEvent has drop, store {
        winner: address,
        amount: u64,
    }

    /// Resource representing an ongoing game.
    struct Game has key {
        creator: address,
        reward: u64,                  // Reward amount in octas (locked prize amount)
        prize: coin::Coin<AptosCoin>, // Coin resource holding the prize funds
        players: vector<address>,     // Players who submitted scores
        scores: vector<u64>,          // Scores corresponding to each player
        highest_score: u64,           // Highest score submitted so far
        current_winner: address,      // Address of the player with the highest score
        active: bool,                 // Whether the game is currently active
    }

    /// Initializes a new game and locks up the reward in a Game resource.
    /// Aborts if a game is already registered by this account.
    public entry fun register_game(creator: &signer, reward_amount: u64) {
        let creator_addr = signer::address_of(creator);
        // Ensure no existing game for this account
        assert!(!exists<Game>(creator_addr), E_GAME_ALREADY_REGISTERED);
        // Withdraw the specified reward from the creator's AptosCoin balance
        let prize_coins = coin::withdraw<AptosCoin>(creator, reward_amount);
        // Publish the Game resource with the locked prize
        move_to(creator, Game {
            creator: creator_addr,
            reward: reward_amount,
            prize: prize_coins,
            players: vector::empty<address>(),
            scores: vector::empty<u64>(),
            highest_score: 0,
            current_winner: @0x0,
            active: true
        });
    }

    /// Submits a score for the given game. Each player (signer) can only submit once.
    /// Aborts if the game is not active or the player has already submitted a score.
    public entry fun submit_score(player: &signer, game_owner: address, score: u64) acquires Game {
        let player_addr = signer::address_of(player);
        // Ensure the game exists and is still active
        assert!(exists<Game>(game_owner), E_GAME_NOT_ACTIVE);
        let game_ref = borrow_global_mut<Game>(game_owner);
        assert!(game_ref.active, E_GAME_NOT_ACTIVE);
        // Prevent duplicate submissions by the same player
        let num_players = vector::length(&game_ref.players);
        let mut i = 0;
        while (i < num_players) {
            assert!(*vector::borrow(&game_ref.players, i) != player_addr, E_ALREADY_SUBMITTED);
            i = i + 1;
        };
        // Record the player's address and score
        vector::push_back(&mut game_ref.players, player_addr);
        vector::push_back(&mut game_ref.scores, score);
        // Update the highest score and winner if this score is greater than the current max
        if (score > game_ref.highest_score) {
            game_ref.highest_score = score;
            game_ref.current_winner = player_addr;
        };
        // Emit an event for the score submission
        let score_event = ScoreSubmittedEvent { player: player_addr, score: score };
        event::emit(score_event);
    }

    /// Ends the game and distributes the reward to the highest scorer.
    /// Only the game creator can call this. If no players participated, the prize is returned to the creator.
    public entry fun distribute_reward(creator: &signer) acquires Game {
        let creator_addr = signer::address_of(creator);
        // Ensure the game exists in the caller's account
        assert!(exists<Game>(creator_addr), E_GAME_NOT_ACTIVE);
        // Move the Game resource out of the creator's account for processing
        let Game {
            creator: game_creator,
            reward: reward_amount,
            prize: prize_coins,
            players: players_list,
            scores: scores_list,
            highest_score: top_score,
            current_winner: top_player,
            active: was_active
        } = move_from<Game>(creator_addr);
        // Ensure the caller is actually the game owner and the game is active
        assert!(game_creator == creator_addr, E_NOT_GAME_OWNER);
        assert!(was_active, E_GAME_NOT_ACTIVE);
        let num_players = vector::length(&players_list);
        if (num_players == 0) {
            // No scores submitted: return the prize to the creator
            coin::deposit<AptosCoin>(creator_addr, prize_coins);
            // Game resource is dropped (players_list and scores_list cleaned up)
            return;
        };
        // Determine the winner and transfer the prize
        let winner_addr = top_player; // player with highest score
        // Ensure winner can receive AptosCoin (has registered a coin store)
        assert!(exists<coin::CoinStore<AptosCoin>>(winner_addr), E_COIN_STORE_NOT_REGISTERED);
        coin::deposit<AptosCoin>(winner_addr, prize_coins);
        // Emit an event about the reward distribution
        let reward_event = RewardDistributedEvent { winner: winner_addr, amount: reward_amount };
        event::emit(reward_event);
        // (The Game resource is now removed from storage, and all local data will be dropped)
    }
}
