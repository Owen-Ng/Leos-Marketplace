// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";  
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";
 
contract Leos is ERC721URIStorage, ReentrancyGuard{

    using Counters for Counters.Counter;
    Counters.Counter private _CollectionIds;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listingPrice = 0.025 ether; 
    mapping(uint256 => MarketItem) private idToMarketItem;
    constructor()  ERC721("NDPunks", "NDP"){
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint itemId; 
        uint256 CollectionId;
        address CollectionAddress;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    } 

    event MarketItemCreated (
        uint indexed itemId,
        uint256 indexed CollectionId,
        address indexed CollectionAddress,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );
 

    /* Updates the listing price of the contract */
    function updateListingPrice(uint _listingPrice) public payable {
      require(owner == msg.sender, "Only marketplace owner can update listing price.");
      listingPrice = _listingPrice;
    }

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
      return listingPrice;
    }
 

    /* Mints a token and lists it in the marketplace */
    /**
    In a collection, it will be a page where we have the owner of the collection address
     */
    function createToken(string memory tokenURI, 
    uint256 price, uint256 collectionfee, 
    uint256 CollectionId,address CollectionAddress) public payable returns (uint) {
      require(msg.value == listingPrice + collectionfee, "Listing price is 0.025 + collectionfee (vary)");
      _tokenIds.increment();
      uint256 newTokenId = _tokenIds.current();

      _mint(msg.sender, newTokenId);
      _setTokenURI(newTokenId, tokenURI);
      createMarketItem(newTokenId, price, CollectionId, CollectionAddress);
      return newTokenId;
    }

    function createMarketItem(
      uint256 tokenId,
      uint256 price,
      uint256 CollectionId,
      address CollectionAddress
    ) private {
      require(price > 0, "Price must be at least 1 wei"); 

      idToMarketItem[tokenId] =  MarketItem(
        tokenId,
        CollectionId,
        CollectionAddress,
        payable(msg.sender),
        payable(address(this)),
        price,
        false
      );

      _transfer(msg.sender, address(this), tokenId);
      emit MarketItemCreated(
        tokenId,
        CollectionId,
        CollectionAddress,
        msg.sender,
        address(this),
        price,
        false
      );
    }

    /* allows someone to resell a token they have purchased */
    function resellToken(uint256 tokenId, uint256 price) public payable {
      require(idToMarketItem[tokenId].owner == msg.sender, "Only item owner can perform this operation");
      require(msg.value == listingPrice, "Price must be equal to listing price");
      idToMarketItem[tokenId].sold = false;
      idToMarketItem[tokenId].price = price;
      idToMarketItem[tokenId].seller = payable(msg.sender);
      idToMarketItem[tokenId].owner = payable(address(this));
      _itemsSold.decrement();

      _transfer(msg.sender, address(this), tokenId);
    }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function createMarketSale(
      uint256 tokenId, address collectionOwnerAddress, uint collectionListingfee
      ) public payable  {
      uint price = idToMarketItem[tokenId].price;
      address seller = idToMarketItem[tokenId].seller;
      require(msg.value == price, "Please submit the asking price in order to complete the purchase");
      idToMarketItem[tokenId].owner = payable(msg.sender);
      idToMarketItem[tokenId].sold = true;
      idToMarketItem[tokenId].seller = payable(address(this));
      _itemsSold.increment();
      _transfer(address(this), msg.sender, tokenId);
      payable(owner).transfer(listingPrice);
      payable(seller).transfer(msg.value);
      payable(collectionOwnerAddress).transfer(collectionListingfee);
    }
    /*
    * Returns all the items of the collection
    */
    function fetchCollectionItems(uint collectionTokenId) public view returns (MarketItem[] memory){ 
        uint itemCount = _tokenIds.current();
        uint collectionSize = 0;
        for (uint i = 1; i <= itemCount; i ++){
            if (idToMarketItem[i].CollectionId == collectionTokenId){
                collectionSize += 1;
            }
        }
        MarketItem[] memory result = new MarketItem[](collectionSize);
        uint index = 0;
        for (uint i= 1; i <= itemCount; i ++){
            if (idToMarketItem[i].CollectionId == collectionTokenId){
                MarketItem storage current = idToMarketItem[i];
                result[index] = current;
                index += 1;
            }
        }
        return result;
    }


    /* Returns all unsold market items */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
      uint itemCount = _tokenIds.current();
      uint unsoldItemCount = _tokenIds.current() - _itemsSold.current();
      uint currentIndex = 0;

      MarketItem[] memory items = new MarketItem[](unsoldItemCount);
      for (uint i = 0; i < itemCount; i++) {
        if (idToMarketItem[i + 1].owner == address(this)) {
          uint currentId = i + 1;
          MarketItem storage currentItem = idToMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    /* Returns only items that a user has purchased */
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
      uint totalItemCount = _tokenIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].owner == msg.sender) {
          itemCount += 1;
        }
      } 
      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].owner == msg.sender) {
          uint currentId = i + 1;
          MarketItem storage currentItem = idToMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    /* Returns only items a user has listed */
    function fetchItemsListed() public view returns (MarketItem[] memory) {
      uint totalItemCount = _tokenIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].seller == msg.sender) {
          itemCount += 1;
        }
      }

      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].seller == msg.sender) {
          uint currentId = i + 1;
          MarketItem storage currentItem = idToMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    


}


