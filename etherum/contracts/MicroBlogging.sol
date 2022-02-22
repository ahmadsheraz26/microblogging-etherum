// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;
contract MicroBlogging {
    struct Account {
        string username;
        uint account_created_at;
        uint[] blogs_indexes;
    }
    struct Blog {
        string content_cid;
        uint account_index;
        uint up_votes;
        uint down_votes;
        uint[] comments_indexes;
    }
    struct Comment {
        string content_cid;
        string parent_cid;
        string blog_cid;
        uint account_index;        
        uint up_votes;
        uint down_votes;
        uint[] replies;
    }    
    Account[] public Accounts;
    Blog[] public Blogs;
    Comment[] public Comments;
    uint public TotalUsers;
    uint public TotalBlogs;
    uint public TotalComments;

    mapping(string => bool) mapUsernames;
    mapping(string => bool) mapBlogCIDs;
    mapping(string => bool) mapCommentsCIDs;
    mapping(bytes32 => bytes32) mapFromIdToNonce;
    mapping(bytes32 => uint) mapFromNonceToAccount;
    mapping(string => uint) mapFromCidToBlog;
    mapping(string => uint) mapFromCidToComment;

    constructor (){
        TotalUsers = 0;
        TotalBlogs = 0;
        TotalComments = 0;
    }

    function CreateAccount(string memory username,string memory pwd) public payable {
        require(bytes(username).length > 0);
        require(bytes(pwd).length > 0);
        require(!mapUsernames[username]);
        require(mapFromIdToNonce[bytes32(abi.encodePacked(username,pwd))] == 0);

        bytes32 uniqueID = bytes32(abi.encodePacked(username,pwd));
        mapFromIdToNonce[uniqueID] = sha256(abi.encodePacked(uniqueID));
        mapFromNonceToAccount[mapFromIdToNonce[uniqueID]] = TotalUsers; 
        
        Accounts.push(Account({
            username:username,
            account_created_at:block.timestamp,
            blogs_indexes:new uint[](0)
        }));
        TotalUsers++;
    }
    function GetAccount(string memory username, string memory pwd) public view returns(Account memory){
        bytes32 nonce = mapFromIdToNonce[bytes32(abi.encodePacked(username,pwd))];
        require(nonce != 0);
        return Accounts[mapFromNonceToAccount[nonce]];
    }
    function GetAllAccounts() public view returns(Account[] memory){
        return Accounts;
    }
    function GetAllBlogs() public view returns(Blog[] memory){
        return Blogs;
    }
    function CreateBlog(string memory username,string memory pwd,string memory blogCID) public payable {
        bytes32 nonce = mapFromIdToNonce[bytes32(abi.encodePacked(username,pwd))];
        require(nonce != 0);
        require(!mapBlogCIDs[blogCID]);

        uint account_index = mapFromNonceToAccount[nonce];
        Accounts[account_index].blogs_indexes.push(TotalBlogs);

        Blogs.push(Blog({
            content_cid: blogCID,
            account_index:account_index,
            comments_indexes:new uint[](0),
            up_votes:0,
            down_votes:0
        }));
        mapFromCidToBlog[blogCID] = TotalBlogs;
        mapBlogCIDs[blogCID] = true;
        TotalBlogs++;

    }
    function UpdateBlog(string memory username, string memory pwd,string memory blogCID,string memory newBlogCID) public payable{
        require(mapFromIdToNonce[bytes32(abi.encodePacked(username,pwd))] != 0);
        require(mapBlogCIDs[blogCID]);
        Blogs[mapFromCidToBlog[blogCID]].content_cid = newBlogCID;
    }

    function UpVoteBlog(string memory username,string memory pwd, string memory blogCID)public payable {
        require(mapFromIdToNonce[bytes32(abi.encodePacked(username,pwd))] != 0);
        require(mapBlogCIDs[blogCID]);
        Blogs[mapFromCidToBlog[blogCID]].up_votes++;
    }
    function DownVoteBlog(string memory username, string memory pwd, string memory blogCID) public payable {
        require(mapFromIdToNonce[bytes32(abi.encodePacked(username,pwd))] != 0);
        require(mapBlogCIDs[blogCID]);
        Blogs[mapFromCidToBlog[blogCID]].down_votes++;
    }

    function CreateComment(string memory username,string memory pwd,string memory commentCID,string memory blogCID,string memory parentCID) public payable {
        bytes32 nonce = mapFromIdToNonce[bytes32(abi.encodePacked(username,pwd))];
        require(nonce != 0);
        require(bytes(commentCID).length != 0);
        require(mapBlogCIDs[blogCID]);
        require(!mapCommentsCIDs[commentCID]);
        
        if (bytes(parentCID).length != 0){
            require(mapCommentsCIDs[parentCID]);
            Comments[mapFromCidToComment[parentCID]].replies.push(TotalComments);
        }else {
            uint BlogIndex = mapFromCidToBlog[blogCID];
            Blogs[BlogIndex].comments_indexes.push(TotalComments);
        }

        uint AccountIndex = mapFromNonceToAccount[nonce];

        Comments.push(Comment({
            content_cid:commentCID,
            blog_cid:blogCID,
            parent_cid:parentCID,
            account_index:AccountIndex,        
            replies:new uint[](0),
            up_votes: 0,
            down_votes:0
        }));
        mapFromCidToComment[commentCID] = TotalComments;
        mapCommentsCIDs[commentCID] = true;
        TotalComments++;

    }
    function getReplies(string memory commentCID) view public returns(uint[] memory){
        require(mapCommentsCIDs[commentCID]);
        return Comments[mapFromCidToComment[commentCID]].replies;
    }
    function UpVoteComment(string memory username, string memory pwd,string memory commentCID) public payable {
        require(mapFromIdToNonce[bytes32(abi.encodePacked(username,pwd))] != 0);
        require(mapCommentsCIDs[commentCID]);
        Comments[mapFromCidToComment[commentCID]].up_votes++;
    }

}