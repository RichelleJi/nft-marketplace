import React from 'react'
import Header from '../../components/Header'
import { useState } from "react";
import GuiseMarketplace from '../../../contracts/GuiseMarketplace.json'
import { erc721ABI } from 'wagmi'
import {type} from "os";


const style = {
  wrapper: `relative`,
  container: `before:content-[''] before:bg-red-500 before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-[url('https://dl.openseauserdata.com/cache/originImage/files/5eb78dc393ad9af3627bbd08283dc5ab.jpg')] before:bg-cover before:bg-center before:opacity-30 before:blur`,
  contentWrapper: `flex h-screen relative justify-center flex-wrap items-center`,
  title: `relative text-white text-[30px] font-semibold mb-4`,
  button: ` relative text-lg font-semibold px-12 py-3 bg-[#363840] rounded-lg mr-5 text-[#e4e8ea] hover:bg-[#4c505c] cursor-pointer`,
  cardContainer: `rounded-[3rem] mx-9`,
  infoContainer: `h-20 bg-[#313338] p-4 rounded-b-lg flex items-center text-white`,
  author: `flex flex-col justify-center ml-4`,
  name: ``,
  input_label: `block text-[#e4e8ea] font-bold mb-2`,
  input_box: `border border-gray-400 py-2 px-3 w-full rounded-md`
}


const ListNFT = () => {
  let initialFormParamsState = { nftAddress: '', tokenId: '', price: '', expirationDate: ''};
  const [formParams, updateFormParams] = useState(initialFormParamsState);
  const ethers = require("ethers");
  const [message, updateMessage] = useState('');

  async function listNFT(e) {
     e.preventDefault();

    // todo: more sanity check input format
     const expDate = Date.parse(formParams.expirationDate);
     if (expDate < Date.now() && formParams.expirationDate !== "0") {
       alert("Expiration date must be in the future");
       return
     }

     try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const guiseMarketplaceContract = new ethers.Contract(GuiseMarketplace.address, GuiseMarketplace.abi, signer)
      const erc721Contract = new ethers.Contract(formParams.nftAddress, erc721ABI, signer)

      const expDateinEpoch = formParams.expirationDate === "0" ? "0" : Math.floor(expDate / 1000).toString()
      const price = ethers.utils.parseUnits(formParams.price, 'ether')

      //it looks like approval is needed for every NFT of the same holder
      const approval = await erc721Contract.setApprovalForAll(GuiseMarketplace.address, true);
      await approval.wait()

      const transaction = await guiseMarketplaceContract.createListing(formParams.nftAddress, formParams.tokenId, price, expDateinEpoch)
      await transaction.wait()

      alert("Successfully listed your NFT!");
      updateMessage("");
      updateFormParams(initialFormParamsState);
      window.location.replace("/list")
    }
    catch (err) {
      alert("NFT listing failed!");
      console.log(err)
    }
  }

  return (
    <>
      <Header />
      <div className={style.wrapper}>
        <div className={style.container}>
          <div className={style.contentWrapper}>
            <div className={style.cardContainer}>
              <img className="rounded-t-lg object-cover h-100 w-96 ..."
                src="https://dl.openseauserdata.com/cache/originImage/files/5eb78dc393ad9af3627bbd08283dc5ab.jpg"
                alt=""
              />
              <div className={style.infoContainer}>
                <img
                  className="h-[2.25rem] rounded-full"
                  src="https://lh3.googleusercontent.com/qQj55gGIWmT1EnMmGQBNUpIaj0qTyg4YZSQ2ymJVvwr_mXXjuFiHJG9d3MRgj5DVgyLa69u8Tq9ijSm_stsph8YmIJlJQ1e7n6xj=s64"
                  alt=""
                />
                <div className={style.author}>
                  <div className={style.name}>TRANQUILLITY in BEAUTY</div>
                  <a
                    className="text-[#1868b7]"
                    href="https://opensea.io/assets/ethereum/0x495f947276749ce646f68ac8c248420045cb7b5e/29460503790862865846018346787516274965296331561146433676951389589059233906693"
                  >
                    Franleiner
                  </a>
                </div>
              </div>
            </div>
            <div className="w-1/5 px-4 py-3">
              <h2 className={style.title}> List your NFT</h2>
              <div className="mb-4">
                <label className={style.input_label}>
                  NFT Address
                </label>
                <input
                  type="text"
                  className={style.input_box}
                  placeholder="Enter NFT Address"
                  onChange={e => updateFormParams({...formParams, nftAddress: e.target.value})}
                  value={formParams.nftAddress}
                />
              </div>
              <div className="mb-4">
                <label className={style.input_label}>
                  Token ID
                </label>
                <input
                  type="number"
                  className={style.input_box}
                  placeholder="Enter Token ID"
                  onChange={e => updateFormParams({...formParams, tokenId: e.target.value})}
                  value={formParams.tokenId}
                />
              </div>
              <div className="mb-4">
                <label className={style.input_label}>
                  Price
                </label>
                <input
                  type="number"
                  className={style.input_box}
                  placeholder="Enter Price"
                  onChange={e => updateFormParams({...formParams, price: e.target.value})}
                  value={formParams.price}
                />
              </div>
                <div className="mb-4">
                  <label className={style.input_label}>
                    Expiration date
                  </label>
                    <input
                      className={style.input_box}
                      placeholder="Enter in YYYY-MM-DD format"
                      onChange={e => updateFormParams({...formParams, expirationDate: e.target.value})}
                      value={formParams.expirationDate}
                    />
                </div>
              <div className="flex justify-center">
                <button className={style.button} onClick={listNFT} >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ListNFT
