/**To test the contract */

describe("Leos", function() {

    it("Simulate Collection creation", async function(){
      const LeosContract= await ethers.getContractFactory("Leos")
      const Leos = await LeosContract.deploy()
      await Leos.deployed()
      const leosAddress = Leos.address;

      const LeosCollection = await ethers.getContractFactory("LeosCollection")
      const Collection = await LeosCollection.deploy(leosAddress)
      await Collection.deployed() 
      const CollectionAddress = Collection.address

      let CollectionlistingPrice = await Collection.getListingPrice() // The listing price set by owner of contract
      CollectionlistingPrice = CollectionlistingPrice.toString()
      console.log("The creator of contract owner price " + CollectionlistingPrice);

      const price = ethers.utils.parseUnits('1', 'ether') // the listing price set by the collection creator

      console.log("Create Collections")
      await Collection.createCollection("https://www.mytokenlocation.com", price,{value : CollectionlistingPrice});
      await Collection.createCollection("https://www.mytokenlocation.com", price,{value : CollectionlistingPrice});
      console.log("After Create")

      var items = await Collection.fetchAllCollections(); 
      //   struct Collection{
      //     uint itemId;
      //     address payable owner;
      //     uint256 price;   
      //    }
      items = await Promise.all(items.map(async i => {
        const tokenUri = await Collection.tokenURI(i.itemId);
        let item = {
            itemId: i.itemId,
            price: i.price,
            owneraddress: i.owner,
            tokenUri
          }
          return item
      }))
      console.log("Collections: ")
      console.log(items)

      console.log("Test for fetchMyCollections function:");

      myCollections = await Collection.fetchMyCollections();

      myCollections = await Promise.all(myCollections.map(async i => {
        const tokenUri = await Collection.tokenURI(i.itemId);
        let item = {
            itemId: i.itemId,
            price: i.price,
            owneraddress: i.owner,
            tokenUri
          }
          return item
      }))

      console.log(myCollections);

      console.log("GetCollectionListingPrice")
      // Since we created 2 we can hard coded with 1 and 2
      console.log("Collection 1")
      let GetCollectionListingPrice = await Collection.getCollectionListingPrice(1);
      console.log(GetCollectionListingPrice);
      console.log(await Collection.getOwner(1));
      console.log("Collection 2")
      let GetCollectionListingPrice1 = await Collection.getCollectionListingPrice(2);
      console.log(GetCollectionListingPrice1)
      console.log(await Collection.getOwner(2));

      console.log("Success")

    })

    it ("Testing Leo contract from hardcoded data", async function(){

      /** These are from revious test  */
      const LeosContract= await ethers.getContractFactory("Leos")
      const Leos = await LeosContract.deploy()
      await Leos.deployed()
      const leosAddress = Leos.address;

      const LeosCollection = await ethers.getContractFactory("LeosCollection")
      const Collection = await LeosCollection.deploy(leosAddress)
      await Collection.deployed() 
      const CollectionAddress = Collection.address

      let CollectionlistingPrice = await Collection.getListingPrice() // The listing price set by owner of contract
      CollectionlistingPrice = CollectionlistingPrice.toString() 

      const price = ethers.utils.parseUnits('1', 'ether') // the listing price set by the collection creator
 
      await Collection.createCollection("https://www.mytokenlocation.com", price,{value : CollectionlistingPrice});
      await Collection.createCollection("https://www.mytokenlocation.com", price,{value : CollectionlistingPrice});
      var items = await Collection.fetchAllCollections(); 
      //   struct Collection{
      //     uint itemId;
      //     address payable owner;
      //     uint256 price;   
      //    }
      items = await Promise.all(items.map(async i => {
        const tokenUri = await Collection.tokenURI(i.itemId);
        let item = {
            itemId: i.itemId,
            price: i.price,
            owneraddress: i.owner,
            tokenUri
          }
          return item
      })) 
      myCollections = await Collection.fetchMyCollections(); 
      myCollections = await Promise.all(myCollections.map(async i => {
        const tokenUri = await Collection.tokenURI(i.itemId);
        let item = {
            itemId: i.itemId,
            price: i.price,
            owneraddress: i.owner,
            tokenUri
          }
          return item
      })) 
      let GetCollectionListingPrice = await Collection.getCollectionListingPrice(1); 
      let GetCollectionListingPrice1 = await Collection.getCollectionListingPrice(2); 
      /**These are from previous test */
      leosListingPrice = await Leos.getListingPrice();
      console.log("Leos listing price: " + leosListingPrice) // Price to list an nft to the collection set by owner of contract
      //createToken(string memory tokenURI, uint256 price, uint256 collectionfee, uint256 CollectionId,address CollectionAddress)
      // tokenURI - the NFT
      // price - price to be sold at
      // collectionfee- listing price from the collection owner
      // CollectionId - the Id which represent one specific collection
      // CollectionAddress - collection address of the contract 
      const auctionPrice = ethers.utils.parseUnits('1', 'ether')
      console.log("before createtoken") 
      await Leos.createToken("https://www.mytokenlocation.com", auctionPrice,items[0].price, items[0].itemId, CollectionAddress,
      {value: (items[0].price.add( leosListingPrice) ).toString()});
      await Leos.createToken("https://www.mytokenlocation.com", auctionPrice,items[1].price, items[1].itemId, CollectionAddress,
      {value: items[1].price.add(leosListingPrice)});  
      await Leos.createToken("https://www.mytokenlocation.com", auctionPrice, items[0].price, items[0].itemId,CollectionAddress,
      {value: (items[0].price.add( leosListingPrice) ).toString()});
      console.log("First createToken passed")
      await Leos.createToken("https://www.mytokenlocation.com", auctionPrice,items[1].price, items[1].itemId, CollectionAddress,
      {value: items[1].price.add(leosListingPrice)});  
      await Leos.createToken("https://www.mytokenlocation.com", auctionPrice,items[1].price, items[1].itemId, CollectionAddress,
      {value: items[1].price.add(leosListingPrice) });  
      console.log("Second createToken passed")

      console.log("Fetching Item from collection specified")
      var marketItem1 = await Leos.fetchCollectionItems(1);
      var marketItem2 = await Leos.fetchCollectionItems(2);

      console.log("Fetching Data from Collection Item")
      marketItem1 = await Promise.all (marketItem1.map(async i =>{
          const tokenUri = await Leos.tokenURI(i.itemId);
          let r = {
            itemId: i.itemId,
              price: i.price,
              collectionaddress: i.CollectionAddress,
              URI: tokenUri
          }
          return r;
      })) 

      console.log("Market Item 1: ")
      console.log(marketItem1);
      marketItem2 = await Promise.all (marketItem2.map(async i =>{
        const tokenUri = await Leos.tokenURI(i.itemId);
        let r = {
          itemId: i.itemId,
            price: i.price,
            collectionaddress: i.CollectionAddress,
            tokenUri
        }
        return r;
        }))
        console.log("Market Item 2: ")
        console.log(marketItem2); 

        const [_, buyerAddress] = await ethers.getSigners()
        // createMarketSale(uint256 tokenId, address collectionOwnerAddress, uint collectionListingfee)
        /**
         * tokenId - the id of the item that is going to be sole
         * collectionOwnerAddress - the address of the creator of this collection
         * collectionListing fee the fee for listing in this collection
         */
         let UnsoldItems = await Leos.fetchMarketItems();
        console.log("UnsoldItems before selling")
         console.log(UnsoldItems);
         console.log("Sell one item: ")
        await Leos.connect(buyerAddress).createMarketSale(marketItem1[1].itemId, items[1].owneraddress, 
          price, {value: marketItem1[1].price })
          UnsoldItems = await Leos.fetchMarketItems();
          console.log("UnsoldItems after selling")
          console.log(UnsoldItems);
        
        let myItems = await Leos.connect(buyerAddress).fetchMyNFTs();
        console.log(myItems)
        let allItems = await Leos.fetchItemsListed();
        console.log(allItems)

        /** Reselling the token */

        console.log("Resell the token");
        await Leos.connect(buyerAddress).resellToken(marketItem1[1].itemId, ethers.utils.parseUnits('2', 'ether'), {value: leosListingPrice })
        console.log(await Leos.connect(buyerAddress).fetchItemsListed());
    })
    it("Should create and execute market sales", async function() {
      const LeosContract= await ethers.getContractFactory("Leos")
      const Leos = await LeosContract.deploy()
      await Leos.deployed()
      const leosAddress = Leos.address;

      const LeosCollection = await ethers.getContractFactory("LeosCollection")
      const Collection = await LeosCollection.deploy(leosAddress)
      await Collection.deployed() 
      const CollectionAddress = Collection.address
       
  
      let CollectionlistingPrice = await Collection.getListingPrice()
      
      CollectionlistingPrice = CollectionlistingPrice.toString()
      console.log(CollectionlistingPrice);


      let leosListingPrice = await Leos.getListingPrice();
      leosListingPrice = leosListingPrice.toString();
      console.log(leosListingPrice);
  
      
      const auctionPrice = ethers.utils.parseUnits('1', 'ether')

      console.log("Create Collections")
      await Collection.createCollection("https://www.mytokenlocation.com", auctionPrice,{value : CollectionlistingPrice});
      await Collection.createCollection("https://www.mytokenlocation.com", auctionPrice,{value : CollectionlistingPrice});
      console.log("After Create")

      
      var items = await Collection.fetchAllCollections();
      // console.log(items)
      items = await Promise.all(items.map(async i => {
        const tokenUri = await Collection.tokenURI(i.itemId);
        let item = {
            itemId: i.itemId,
            price: i.price,
            tokenUri
          }
          return item
      }))
      console.log("Collections: ")
      console.log(items)

      leosListingPrice = await Leos.getListingPrice();
      console.log("before createtoken")
      console.log(items[0].price.add( leosListingPrice) )
      await Leos.createToken("https://www.mytokenlocation.com", auctionPrice,items[0].price, items[0].itemId, CollectionAddress,
      {value: (items[0].price.add( leosListingPrice) ).toString()});
      await Leos.createToken("https://www.mytokenlocation.com", auctionPrice, items[0].price, items[0].itemId,CollectionAddress,
      {value: (items[0].price.add( leosListingPrice) ).toString()});
      console.log("First createToken passed")
      await Leos.createToken("https://www.mytokenlocation.com", auctionPrice,items[1].price, items[1].itemId, CollectionAddress,
      {value: items[1].price.add(leosListingPrice)});  
      await Leos.createToken("https://www.mytokenlocation.com", auctionPrice,items[1].price, items[1].itemId, CollectionAddress,
      {value: items[1].price.add(leosListingPrice) });  
      console.log("Second createToken passed")


      var marketItem1 = await Leos.fetchCollectionItems(items[0].itemId );
      var marketItem2 = await Leos.fetchCollectionItems(items[1].itemId);

      console.log("Fetching Data from Collection Item")
      marketItem1 = await Promise.all (marketItem1.map(async i =>{
          const tokenUri = await Leos.tokenURI(i.itemId);
          let r = {
            itemId: i.itemId,
              price: i.price,
              collectionaddress: i.CollectionAddress,
              URI: tokenUri
          }
          return r;
      })) 

      console.log("Market Item 1: ")
      console.log(marketItem1);
      marketItem2 = await Promise.all (marketItem2.map(async i =>{
        const tokenUri = await Leos.tokenURI(i.itemId);
        let r = {
          itemId: i.itemId,
            price: i.price,
            collectionaddress: i.CollectionAddress,
            tokenUri
        }
        return r;
        }))
        console.log("Market Item 2: ")
        console.log(marketItem2); 

        const [_, buyerAddress] = await ethers.getSigners()

        
        let collectionOwner1Address = await Collection.getOwner(items[0].itemId);

        await Leos.connect(buyerAddress).createMarketSale(marketItem1[1].itemId, collectionOwner1Address, 
          auctionPrice, {value: marketItem1[1].price })

        console.log("Market Item created")
    })

    

  })