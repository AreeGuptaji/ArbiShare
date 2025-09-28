// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Decentralized governance for MEV-Share protocol parameters
contract MEVShareGovernance is Ownable, ReentrancyGuard {
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        bytes callData;
        address target;
        uint256 value;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool cancelled;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votes;
    }

    struct ProposalParams {
        uint256 votingDelay;     // Delay before voting starts
        uint256 votingPeriod;    // Duration of voting
        uint256 proposalThreshold; // Min MEV score to propose
        uint256 quorumThreshold;   // Min votes needed to pass
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public mevScores;
    mapping(address => bool) public worldIdVerified;
    
    uint256 public proposalCount;
    ProposalParams public params;
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);

    constructor(address initialOwner) Ownable(initialOwner) {
        params = ProposalParams({
            votingDelay: 1 days,
            votingPeriod: 7 days,
            proposalThreshold: 1000, // Min MEV score to propose
            quorumThreshold: 10000   // Min total votes needed
        });
    }

    // Create a new governance proposal
    function propose(
        string memory title,
        string memory description,
        address target,
        uint256 value,
        bytes memory callData
    ) external returns (uint256) {
        require(worldIdVerified[msg.sender], "World ID verification required");
        require(mevScores[msg.sender] >= params.proposalThreshold, "Insufficient MEV score");
        
        uint256 proposalId = ++proposalCount;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.target = target;
        proposal.value = value;
        proposal.callData = callData;
        proposal.startTime = block.timestamp + params.votingDelay;
        proposal.endTime = proposal.startTime + params.votingPeriod;
        
        emit ProposalCreated(proposalId, msg.sender, title, proposal.startTime, proposal.endTime);
        return proposalId;
    }

    // Vote on a proposal
    function vote(uint256 proposalId, bool support) external {
        require(worldIdVerified[msg.sender], "World ID verification required");
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 weight = mevScores[msg.sender];
        require(weight > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = weight;
        
        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    // Execute a passed proposal
    function execute(uint256 proposalId) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp > proposal.endTime, "Voting still active");
        require(!proposal.executed, "Already executed");
        require(!proposal.cancelled, "Proposal cancelled");
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        require(totalVotes >= params.quorumThreshold, "Quorum not reached");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");
        
        proposal.executed = true;
        
        if (proposal.callData.length > 0) {
            (bool success,) = proposal.target.call{value: proposal.value}(proposal.callData);
            require(success, "Execution failed");
        }
        
        emit ProposalExecuted(proposalId);
    }

    // Update MEV score (called by MEVShareHook)
    function updateMEVScore(address user, uint256 newScore) external onlyOwner {
        mevScores[user] = newScore;
    }

    // Update World ID verification status
    function updateWorldIDStatus(address user, bool verified) external onlyOwner {
        worldIdVerified[user] = verified;
    }

    // Update governance parameters
    function updateParams(ProposalParams memory newParams) external onlyOwner {
        params = newParams;
    }

    // Get proposal details
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        address target,
        uint256 value,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed,
        bool cancelled
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.target,
            proposal.value,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed,
            proposal.cancelled
        );
    }

    // Check if user has voted on proposal
    function hasVoted(uint256 proposalId, address user) external view returns (bool) {
        return proposals[proposalId].hasVoted[user];
    }

    // Get user's vote weight on proposal
    function getVoteWeight(uint256 proposalId, address user) external view returns (uint256) {
        return proposals[proposalId].votes[user];
    }
}
