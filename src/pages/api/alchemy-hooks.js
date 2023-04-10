import web3EventParser from "../../utils/web3EventParser"
import { createClient } from "@supabase/supabase-js";
import config from "../../../config";


const DEFAULT_LISTING_STATUS = "active";

const handler = async (req, res) => {
  let logs = req.body.event.data.block.logs

  if (logs.length > 0) {
    console.log("log found")
    console.log(logs)

    const {
      listingId,
      seller,
      nftAddress,
      tokenId,
      price,
      expirationTime,
    } = web3EventParser(logs)

    await saveNFTListing(listingId, seller, nftAddress, tokenId, price, expirationTime);
  }
  res.send({received: true})
}

const saveNFTListing = async (listingId, seller, nftAddress, tokenId, price, expirationTime) =>{
  const supabase = createClient(config.superbaseUrl, config.superbaseAnon)

  const {error} = await supabase
    .from('NftListings')
    .insert({
      id: listingId,
      sellerAddress: seller,
      nftAddress: nftAddress,
      nftTokenId: tokenId,
      price: price,
      status: DEFAULT_LISTING_STATUS,
      expirationDate: expirationTime
    })
}

export default handler