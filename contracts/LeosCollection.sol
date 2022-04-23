// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";  
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract LeosCollection is ERC721URIStorage, ReentrancyGuard{
    using Counters for Counters.Counter;
    Counters.Counter private _CollectionIds;
    address payable owner; 
    address LeosAddress;
    uint256 ListingPrice = 0.08 ether;

    mapping(uint256 => Collection) private idToCollection;

    struct Collection{
        uint itemId;
        address payable owner;
        uint256 price;  
        string description;
        
    }
    event CollectionCreated(
        uint indexed itemId,
        address owner,
        uint256 price ,
        string description
        );

    /**
    Initialization. Owner will be the person who deployed the contract
    LeosAddress is the contract we are going to interact with.
    LeosCollection is like the parent of the child.

    In which the child inherit some values from the parent
     */
    constructor(address LeosContractAddress) ERC721("NDPunks", "NDP"){
        owner = payable(msg.sender);
        LeosAddress = LeosContractAddress;
    }

    /**
    Return the listing price that need to be paid to the owner of the contract */
    function getListingPrice() public view returns(uint256){
     
        return ListingPrice;
    }
    /**
    Returns the price/Listing price set by someone who created the collection 
    */
    function getCollectionListingPrice(uint ItemId) public view returns(uint256){
        return idToCollection[ItemId].price;
    }
    /**
    Returns the owner address of the collection (NOT The contract owner)
     */
    function getOwner(uint id) public view returns(address){
        return idToCollection[id].owner;
    }

    /**
    Create a collection. 
    It result in the incrementation of CollectionIds
     */
    function createCollection(string memory tokenURI, uint256 price, string memory description) public payable returns(uint){
        require(msg.value == ListingPrice, "Listing price is 0.08 ether");
        _CollectionIds.increment();
        uint256 newTokenId = _CollectionIds.current(); 
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI); 
        setApprovalForAll(LeosAddress,  true);
        idToCollection[newTokenId] = Collection(
            newTokenId,
            payable(msg.sender),
            price,
            description
        );
        emit CollectionCreated(
            newTokenId,
            msg.sender,
            price,
            description
        );
        owner.transfer(ListingPrice);
        return newTokenId;
    }
    /**
    Return all the collection created. It will be useful for Collection page.
     */
    function fetchAllCollections() public view returns(Collection[] memory){
        uint itemCount = _CollectionIds.current();
        uint index = 0;

        Collection[] memory c = new Collection[](itemCount);

        for (uint i = 1 ; i <= itemCount ; i ++){
            Collection storage currentItem = idToCollection[i ];
            c[index] = currentItem;
            index += 1; 
        }
        return c; 
    }

    /**
    Returns all collections created by a user
    */
    function fetchMyCollections() public view returns (Collection[] memory){
        uint itemCount = _CollectionIds.current();
        uint index = 0;
        uint myCollectionsCount = 0;
        for (uint i = 1 ; i <= itemCount; i ++){
            if (idToCollection[i ].owner == msg.sender){
                myCollectionsCount ++;
            }
        }

        Collection[] memory c = new Collection[](myCollectionsCount);
        for (uint i = 1 ; i <= itemCount ; i ++  ){
            if (idToCollection[i].owner == msg.sender){
                Collection storage currentitem = idToCollection[i];
                c[index] = currentitem;
                index++;
            }
        }
        return c; 
    }



}