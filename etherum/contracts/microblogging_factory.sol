// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract BlogAccountFactory {
    mapping(string => bool) AccountNames;
    address[] public Accounts;

    function createAccount(string memory Name) public {
        require(!AccountNames[Name]);
        address newAccount = address(new BlogAccount(Name, msg.sender));
        Accounts.push(newAccount);
    }
    function getAccounts() public view returns(address[] memory) {
        return Accounts;
    }

}
contract BlogAccount {
    struct Blog {
        string title;
        string content;
    }

    address owner;
    string name;
    uint totalBlogs;    
    Blog[] blogs;

    constructor (string memory Name, address Owner) {
        owner = Owner;
        name = Name;
        totalBlogs = 0;
    }
    function getAccountDetails() public view returns(address,string memory) {
        return (owner,name);
    }
    function getAllBlogs() public view returns(Blog[] memory) {
        return blogs;
    }
    function createBlog(string memory title, string memory content) public payable {
        require(msg.sender == owner);
        totalBlogs++;
        Blog memory NewBlog = Blog({
            title:title,
            content:content
        });
        blogs.push(NewBlog); 
    }

}