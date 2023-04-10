import config from '../../../config.js'
import { createClient } from "@supabase/supabase-js";
import NFTCard from "../../components/NFTCard";
import Header from '../../components/Header'

const Marketplace = ({ nftListings }) => {
  return (
    <>
      <Header />
      <div className="flex flex-wrap ">
        {nftListings.map((nftListing) => (
          <NFTCard key={nftListing.tokenId}
            nftListing={nftListing}
          />
        ))}
      </div>
    </>
  )
}

export const getServerSideProps = async () => {
  const supabase = createClient(config.superbaseUrl, config.superbaseAnon)
  const { data }  = await supabase
    .from('NftListings')
    .select()
    .eq('status', 'active')

  // const listingId = 7;
  // const seller = '0x0C5Cc5399BFF7f213810323aa97FeF5f60ed7642';
  // const nftAddress = '0x2e992749E96D7071bb80446f369a90c4c1f9f8bC';
  // const tokenId = 9;
  // const price = 0.9;
  // const expirationTime = new Date(9999, 11, 31);
  // const { error } = await supabase
  //   .from('NftListings')
  //   .insert({
  //     id: listingId,
  //     sellerAddress: seller,
  //     nftAddress: nftAddress,
  //     nftTokenId: tokenId,
  //     price: price,
  //     status: "active",
  //     expirationDate: expirationTime
  //   })

  // console.log("eroor----> ", error)

  let nftListings = JSON.parse(JSON.stringify(data));

  return {
    props: { nftListings },
  };
};

export default Marketplace