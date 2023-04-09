// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GuiseMarketplace is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;

    bytes4 private constant INTERFACE_ID_ERC721 = 0x80ac58cd;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant NO_EXPIRATION_TIME = type(uint256).max;

    // starts at 1
    Counters.Counter private _listingIdTracker;

    uint256 public fee;
    address public feeReceipient;

    struct Listing {
        address nftAddress;
        uint256 tokenId;
        uint256 price;
        uint256 expirationTime;
        address seller;
    }

    //  listingId => Listing
    mapping(uint256 => Listing) public listings;

    // nftAddress => tokenId => seller => listingId
    mapping(address => mapping(uint256 => mapping(address => uint256))) public reverseListings;

    event ItemListed(
        uint256 listingId,
        address seller,
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        uint256 expirationTime
    );

    event ItemUpdated(
        uint256 listingId,
        address seller,
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        uint256 expirationTime
    );

    event ItemSold(
        uint256 listingId,
        address nftAddress,
        uint256 tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    event ItemCanceled(uint256 listingId, address seller, address nftAddress, uint256 tokenId);

    event UpdateFee(uint256 fee);
    event UpdateFeeRecipient(address feeRecipient);

    modifier isListed(uint256 _listingId) {
        require(listings[_listingId].seller != address(0), "not listed");
        _;
    }

    modifier notListed(address _nftAddress, uint256 _tokenId, address _seller) {
        require(reverseListings[_nftAddress][_tokenId][_seller] == 0, "already listed");
        _;
    }

    modifier validListing(uint256 listingId) {
        (bool isValid, string memory errorMsg) = isValidListing(listingId);
        require(isValid, errorMsg);
        _;
    }

    modifier onlySeller(uint256 _listingId) {
        require(listings[_listingId].seller == _msgSender(), "not seller");
        _;
    }

    constructor(uint256 _fee, address _feeRecipient) {
        setFee(_fee);
        setFeeRecipient(_feeRecipient);
    }

    function isValidListing(uint256 _listingId) public view returns (bool isValid, string memory errorMsg) {
        Listing storage listedItem = listings[_listingId];
        if (IERC165(listedItem.nftAddress).supportsInterface(INTERFACE_ID_ERC721)) {
            IERC721 nft = IERC721(listedItem.nftAddress);
            if (nft.ownerOf(listedItem.tokenId) != listedItem.seller) return (false, "seller is not owning item");
        } else {
            return (false, "invalid nft address");
        }
        if (listedItem.expirationTime < block.timestamp) return (false, "listing expired");

        isValid = true;
    }

    function createListing(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price,
        uint256 _expirationTime
    ) external notListed(_nftAddress, _tokenId, _msgSender()) {
        if (_expirationTime == 0) _expirationTime = NO_EXPIRATION_TIME;
        require(_expirationTime > block.timestamp, "invalid expiration time");

        if (IERC165(_nftAddress).supportsInterface(INTERFACE_ID_ERC721)) {
            IERC721 nft = IERC721(_nftAddress);
            require(nft.ownerOf(_tokenId) == _msgSender(), "not owning item");
            require(nft.isApprovedForAll(_msgSender(), address(this)), "item not approved");
        } else {
            revert("invalid nft address");
        }

        _listingIdTracker.increment();
        reverseListings[_nftAddress][_tokenId][_msgSender()] = _listingIdTracker.current();

        listings[_listingIdTracker.current()] = Listing(
            _nftAddress,
            _tokenId,
            _price,
            _expirationTime,
            _msgSender()
        );

        emit ItemListed(
            _listingIdTracker.current(),
            _msgSender(),
            _nftAddress,
            _tokenId,
            _price,
            _expirationTime
        );
    }

    function updateListing(
        uint256 _listingId,
        uint256 _newPrice,
        uint256 _newExpirationTime
    ) external nonReentrant onlySeller(_listingId) {
        if (_newExpirationTime == 0) _newExpirationTime = NO_EXPIRATION_TIME;
        require(_newExpirationTime > block.timestamp, "invalid expiration time");

        Listing storage listedItem = listings[_listingId];
        address nftAddress = listedItem.nftAddress;
        uint256 tokenId = listedItem.tokenId;
        if (IERC165(nftAddress).supportsInterface(INTERFACE_ID_ERC721)) {
            IERC721 nft = IERC721(nftAddress);
            require(nft.ownerOf(tokenId) == _msgSender(), "not owning listing");
        } else {
            revert("invalid nft address");
        }

        listedItem.price = _newPrice;
        listedItem.expirationTime = _newExpirationTime;

        emit ItemUpdated(
            _listingId,
            listedItem.seller,
            nftAddress,
            tokenId,
            _newPrice,
            _newExpirationTime
        );
    }

    function cancelListing(uint256 _listingId) external nonReentrant onlySeller(_listingId) {
        Listing storage listedItem = listings[_listingId];

        emit ItemCanceled(_listingId, _msgSender(), listedItem.nftAddress, listedItem.tokenId);

        _deleteListing(_listingId);
    }

    function _deleteListing(uint256 _listingId) internal {
        Listing storage listedItem = listings[_listingId];

        delete reverseListings[listedItem.nftAddress][listedItem.tokenId][_msgSender()];
        delete listings[_listingId];
    }

    function buyItem(uint256 _listingId) external payable nonReentrant isListed(_listingId) validListing(_listingId) {
        Listing storage listedItem = listings[_listingId];
        address nftAddress = listedItem.nftAddress;
        uint256 tokenId = listedItem.tokenId;
        address seller = listedItem.seller;
        uint256 price = listedItem.price;

        // Transfer NFT to buyer
        IERC721(nftAddress).safeTransferFrom(seller, _msgSender(), tokenId);

        _deleteListing(_listingId);

        emit ItemSold(
            _listingId,
            nftAddress,
            tokenId,
            seller,
            _msgSender(),
            price
        );

        _buyItem(price, seller);
    }

    function _buyItem(
        uint256 _price,
        address _seller
    ) internal {
        require(msg.value == _price, "incorrect MATIC value sent");
        uint256 feeAmount = _price * fee / BASIS_POINTS;

        bool success;
        (success, ) = feeReceipient.call{value: feeAmount}("");
        require(success, "feeReceipient MATIC transfer failed");

        (success, ) = _seller.call{value: _price - feeAmount}("");
        require(success, "_seller MATIC transfer failed");
    }

    // admin

    function setFee(uint256 _fee) public onlyOwner {
        require(_fee < BASIS_POINTS, "max fee");
        fee = _fee;
        emit UpdateFee(_fee);
    }

    function setFeeRecipient(address _feeRecipient) public onlyOwner {
        feeReceipient = _feeRecipient;
        emit UpdateFeeRecipient(_feeRecipient);
    }
}