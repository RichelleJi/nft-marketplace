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

  let nftListings = JSON.parse(JSON.stringify(data));

  return {
    props: { nftListings },
  };
};

export default Marketplace