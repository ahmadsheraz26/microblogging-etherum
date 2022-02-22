var btnUpload = $("#upload_file"),
	btnOuter = $(".button_outer");
btnUpload.on("change", function (e) {
	var ext = btnUpload.val().split('.').pop().toLowerCase();
	if ($.inArray(ext, ['gif', 'png', 'jpg', 'jpeg']) == -1) {
		$(".error_msg").text("Not an Image...");
	} else {
		$(".error_msg").text("");
		btnOuter.addClass("file_uploading");
		setTimeout(function () {
			btnOuter.addClass("file_uploaded");
		}, 3000);
		var uploadedFile = URL.createObjectURL(e.target.files[0]);
		setTimeout(function () {
			$("#uploaded_view").append('<img src="' + uploadedFile + '" />').addClass("show");
		}, 3500);
	}
});
$(".file_remove").on("click", function (e) {
	$("#uploaded_view").removeClass("show");
	$("#uploaded_view").find("img").remove();
	btnOuter.removeClass("file_uploading");
	btnOuter.removeClass("file_uploaded");
});

const txt = document.querySelector('#blog-content');

function setNewSize() {
	this.style.height = "1px";
	this.style.height = this.scrollHeight + "px";
}
txt.addEventListener('keyup', setNewSize);



//utilities
const uploadImage = (node, photo) => {
    return new Promise((resolve,reject) => {
        const reader = new FileReader()
        let ImageUrl;
        reader.readAsArrayBuffer(photo.files[0]) // Read Provided File    
        reader.onloadend = async () => {
            const buf = buffer.Buffer(reader.result) // Convert data into buffer
            const {cid} = await node.add(buf)         
            ImageUrl =  `https://ipfs.io/ipfs/${cid.toString()}`        
            resolve(ImageUrl)
        }    
    })
}
var stringToHTML = function (str) {
	var parser = new DOMParser();
	var doc = parser.parseFromString(str, 'text/html');
	return doc.body.children[0];
};
const getTime = (day) => {
    var date = day.getFullYear()+'-'+(day.getMonth()+1)+'-'+day.getDate();
    var time = day.getHours() + ":" + day.getMinutes() + ":" + day.getSeconds();
    return date+' '+time;
}
const getData = async (node,cid) => {
    const stream = node.cat(cid)
    let data = ''
    for await (const chunk of stream) {
        data += chunk
    }
    return data
}
