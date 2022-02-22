let IpfsNode
let Contract
let address
const username = sessionStorage.getItem("username")
const password = sessionStorage.getItem("password")
const PostFormSubmit = document.getElementById("blogSubmit")        

const createPost = async (event) => {
    event.preventDefault();
    const BlogContent = document.getElementById("blog-content").value
    const ImageContent = document.getElementById("upload_file")
    let Blog = {}
    if (BlogContent != "") Blog.Content = BlogContent;        
    if (ImageContent.files.length > 0) {
        const ImageURL = await uploadImage(IpfsNode,ImageContent)    
        Blog.Image = ImageURL
    }
    Blog.createdAt = getTime(new Date())
    const {cid} = await IpfsNode.add(JSON.stringify(Blog))
    await Contract.methods.CreateBlog(username, password,cid.toString()).send({
        from:address,
        gas:'1000000'
    })
    ImageContent.value = null
    BlogContent.value = ""
}
const addComment = async (event,blogIndex,blogCID, parentCID = "") => {
    event.preventDefault()
    let Comment = {};
    const CommentValue = document.getElementById("comment"+ blogCID + parentCID + blogIndex).value
    Comment.Content = CommentValue
    Comment.createdAt = getTime(new Date())
    const { cid } = await IpfsNode.add(JSON.stringify(Comment))
    await Contract.methods.CreateComment(username,password, cid.toString(),blogCID,parentCID).send({
        from:address,
        gas:'1000000'
    })
    updatePosts()    
}
const upVoteComment = async (event, commentCID) => {
    event.preventDefault()
    $("#like-button-"+commentCID).toggleClass('is-active');
    await Contract.methods.UpVoteComment(username,password,commentCID).send({
        from: address,
        gas:'1000000'
    })
}
const upVoteBlog = async (event, blogCID) => {
    event.preventDefault()
    $("#like-button-"+blogCID).toggleClass('is-active');
    
    await Contract.methods.UpVoteBlog(username,password,blogCID).send({
        from: address,
        gas:'1000000'
    })
}
const createCommentView = async (comment,commentIndex, replies = "") => {
    const commentCID = comment['content_cid'];
    const replies_indexes = await Contract.methods.getReplies(commentCID).call()        
    const blogCID = comment['blog_cid']
    const owner_index = comment['account_index'];
    const {username} = await Contract.methods.Accounts(owner_index).call()
    const CommentContent = JSON.parse(await getData(IpfsNode,commentCID))
    const AddComment = 
    `<form class ="add_Comments">
        <input id = "comment${blogCID}${commentCID}${commentIndex}" type = "text" placeholder = "Add Reply"/>
        <input onClick = "addComment(event,${commentIndex}, '${blogCID}','${commentCID}')" type = "submit" value = "Post" />
    </form>`        
    const CommentsHTMLStart = `
    <li class="comment">
        <div class="comment-meta">
            <h3 class="me-2">${username}</h3>
            <span class="text-muted">${getTime(new Date(CommentContent.createdAt))}</span>
        </div>
        <div class="comment-body">${CommentContent.Content}</div>
        <div class="stats comment-stats">
            <div class="wrapper-icons-button">
                <a onClick = "upVoteComment(event,'${commentCID}')" href="javascript:void(0);" id = "like-button-${commentCID}" class="like-button">
                    <i class="material-icons not-liked bouncy">favorite_border</i>
                    <i class="material-icons is-liked bouncy">favorite</i>
                    <span class="like-overlay"></span>
                </a>
                <span class="text-muted"><b>${comment.up_votes}</b></span>
            </div>
            <div class="wrapper-icons-button">
                <a href="javascript:void(0);" class="comments-button">
                    <i class="material-icons">chat</i>
                </a>
                <span class="text-muted"><b>${replies_indexes.length}</b></span>
            </div>
        </div>`
    const CommentsHTMLEnd = `</li>`

    return CommentsHTMLStart + AddComment + replies + CommentsHTMLEnd

}
const createReplies = async (comment,commentIndex) => {
    const commentCID = comment['content_cid'];
    const replies_indexes = await Contract.methods.getReplies(commentCID).call()        
    if (replies_indexes.length == 0) return ""
    let replies = `<ul class = "comments">`    
    for (let i =0 ; i< replies_indexes.length;i++){
        const reply = await Contract.methods.Comments(replies_indexes[i]).call()
        const replyOfreplies = await createReplies(reply,replies_indexes[i])
        replies += await createCommentView(reply, replies_indexes[i], replyOfreplies)
    }
    replies += `</ul>`
    return replies
}

const updateComments = async (comments_indexes) => {
    if (comments_indexes == undefined) return ""
    const CommentsStart = `<section class = "commentsContainer"><ul class="comments first">`
    const CommentsEnd = `</ul></section>`
    let CompleteComments = CommentsStart;
    for (let i=0; i< comments_indexes.length;i++){
        const comment = await Contract.methods.Comments(comments_indexes[i]).call();    
        const commentReplies = await createReplies(comment,comments_indexes[i])
        CompleteComments += await createCommentView(comment,comments_indexes[i], commentReplies)
    }
    return CompleteComments += CommentsEnd
}

const updatePosts = async () => {    
    const Posts = await Contract.methods.GetAllBlogs().call()
    const PostContainer = document.getElementById("posts-container")
    for (let i=0; i< Posts.length;i++){
        const Post = Posts[i]
        const BlogCID = Post['content_cid'];
        const Comments_Indexes = Post['comments_indexes']
        const blog_likes = Post['up_votes']
        const OwnerIndex = Post['account_index']
        let BlogContent = null;
        let username = null;
        try {
            BlogContent = JSON.parse(await getData(IpfsNode,BlogCID))
            username = (await Contract.methods.Accounts(OwnerIndex).call()).username;    
        }catch(e){
            BlogContent = username = null;
            console.log(e);
        }
        if (username == null || BlogContent === null) continue;
        
        const blog_comments = Comments_Indexes.length
        const blog_content = BlogContent.Content
        const blog_imageURL = BlogContent.Image
        const blog_owner= username
        const blog_createdAt = BlogContent.createdAt

        const ContainerStart = `<div class = 'container'><div class = 'post-content'>`
        const ContainerEnd = `</div></div>`
        const Heading = `<div class='top-bar'><h2 class='me-1'>${blog_owner}</h2><span class='text-muted'>${blog_createdAt}</span></div>`
        const ContentStart =`<div class="content"><p>${blog_content}</p>`
        const ContentImage= `<img src = ${blog_imageURL}/>`
        const ContentEnd = `</div>`
        const Content = ContentStart + (blog_imageURL != undefined? ContentImage:"") + ContentEnd
        const Blog_Stats = `
        <div class="stats">
            <div class="wrapper-icons-button">
                <a onClick = "upVoteBlog(event,'${BlogCID}')" href="javascript:void(0);" id = "like-button-${BlogCID}" class="like-button">
                    <i class="material-icons not-liked bouncy">favorite_border</i>
                    <i class="material-icons is-liked bouncy">favorite</i>
                    <span class="like-overlay"></span>
                </a>
                <span class="text-muted"><b>${blog_likes}</b></span>
            </div>
            <div class="wrapper-icons-button">
                <a href="javascript:void(0);" class="comments-button">
                    <i class="material-icons">chat</i>
                </a>
                <span class="text-muted"><b>${blog_comments}</b></span>
            </div>
        </div>`
        const AddComment = 
        `<form action = "#" class ="add_Comments">
            <input id = "comment${BlogCID}${i}" type = "text" placeholder = "Add Comment"/>
            <input onClick = "addComment(event,${i}, '${BlogCID}')" type = "submit" value = "Post" name = "commentSubmit"/>
        </form>`
        const CompleteComments = await updateComments(Comments_Indexes,BlogCID)
        const PostHTML = ContainerStart + Heading + Content + Blog_Stats + AddComment + CompleteComments + ContainerEnd
        PostContainer.appendChild(stringToHTML(PostHTML))
    }
}

BlogStore.onReady = () => {
    IpfsNode = BlogStore.Node
    Contract = BlogStore.Contract
    address = BlogStore.Accounts[0]
    window.Contract = Contract
    updatePosts()
    PostFormSubmit.addEventListener("click", createPost)
}
BlogStore.init()

