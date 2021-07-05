var image_ = [];
var num = 0;
var data;
var request = new XMLHttpRequest();

request.open('GET', 'https://api.countapi.xyz/hit/asnise.github.io/main', true);
request.send();
request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
		data = JSON.parse(request.responseText);
		document.getElementById("visits").innerHTML = "ตอนนี้มีคนเข้ามาดูแล้ว : " + data.value + " ครั้ง";
	}
}

function cansel_win(idtag ,name,content,img_1,img_2,img_3,download)
{
	var win_alert = document.getElementById(idtag);
	if (win_alert.style.display === "block")
	{
		win_alert.style.display = "none";
	}
	else
	{
		win_alert.style.display = "block";
	}
		document.getElementById("img_1").src = img_1;
		image_[0] = img_1;
		image_[1] = img_2;
		image_[2] = img_3;
		document.getElementById("title_name").innerHTML = name;
		document.getElementById("content_mod").innerHTML = content;
		document.getElementById("download_bt").href = download;
		
	
};

function slider_bt(trun)
{
	if(trun == "next")
	{
		num += 1;
	}
	
	if(trun == "back")
	{
		num -= 1;
	}
	
	if(num < 0)
	{
		num = 2;
	}
	
	if(num > 2)
	{
		num = 0;
	}
	
	document.getElementById("img_1").src = image_[num];
}
