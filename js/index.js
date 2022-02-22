const createAccount = async (event,Contract,signupButton) => {
    event.preventDefault()
    signupButton.disable = true
    const username=  document.getElementById("username").value
    const password = document.getElementById("pass").value
    const address = document.getElementById("address").value
    
    await Contract.methods.CreateAccount(username,password).send({
        from:address,
        gas:'1000000' 
    })
    signupButton.disable = false
    sessionStorage.setItem("username", username)
    sessionStorage.setItem("password", password)
    window.location.replace("http://127.0.0.1:5500/blog.html")

}

const SignIn = async (event,Contract,signinButton) => {
    event.preventDefault()
    signinButton.disable = true
    const username=  document.getElementById("your_username").value
    const password = document.getElementById("your_pass").value
    let account = null;
    try {
        account = await Contract.methods.GetAccount(username,password).call()
        sessionStorage.setItem("username", username)
        sessionStorage.setItem("password", password)
        window.location.replace("http://127.0.0.1:5500/blog.html")
    }catch(e) {
        console.log("Account Doesn't Exist")
        throw e
    }
    signinButton.disable = false
}


BlogStore.onReady = () => {
    const IpfsNode = BlogStore.Node
    const Contract = BlogStore.Contract;
    const SignUpButton = document.getElementById("signup")
    const SignInButton = document.getElementById("signin")

    SignUpButton.addEventListener("click", (event) => createAccount(event,Contract,SignUpButton));
    SignInButton.addEventListener("click", (event) => SignIn(event,Contract,SignInButton));
}
BlogStore.init()
