import { BiHeart } from 'react-icons/bi'

const style = {
  details: `p-3`,
  info: `flex justify-between text-[#e4e8eb] drop-shadow-xl`,
  infoLeft: `flex-0.4 text-left`,
  assetName: `font-bold text-lg mt-2`,
  infoRight: `flex-0.4 text-right`,
  priceTag: `font-semibold text-sm text-[#8a939b]`,
  priceValue: `text-xl font-bold mt-2`,
  likes: `text-[#8a939b] font-bold flex items-center w-full justify-end mt-3`,
  likeIcon: `text-xl mr-2`,
}

const NFTCard = ({ nftListing }) => {
  console.log("data----->", nftListing.imageLink)
  const image = nftListing.imageLink

  return (
    <>
      <div>
        <div className={style.details}>
          <div className={style.info}>
            <div className={style.infoLeft}>
              <div className={style.assetName}>ID: {nftListing.id}</div>
              <div className={style.priceTag}>Expire: {nftListing.expirationDate}</div>
            </div>
            <div className={style.infoRight}>
              <div className={style.priceValue}>
                {nftListing.price} MATIC
              </div>
            </div>
          </div>
          <img src={image} />
          <div className={style.likes}>
            <span className={style.likeIcon}>
              <BiHeart />
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default NFTCard
