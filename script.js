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

function img_win(idtag,scr) {
	var win_alert = document.getElementById(idtag);
	var img = document.getElementById("imgpre");
	if (win_alert.style.display === "block") {
		win_alert.style.display = "none";
	}
	else {
		win_alert.style.display = "block";
		img.src = scr;
	}
};

function cansel_win(idtag) {
	var win_alert = document.getElementById(idtag);
	if (win_alert.style.display === "block") {
		win_alert.style.display = "none";
	}
	else {
		win_alert.style.display = "block";
	}
};


function slid_win(idtag, more) {
	var win_alert = document.getElementById(idtag);
	var mores = document.getElementById(more);

	if (win_alert.style.display === "block") {
		win_alert.style.display = "none";
		mores.innerHTML = "อ่านเพิ่ม";
	}
	else {
		win_alert.style.display = "block";
		mores.innerHTML = "แสดงน้อยลง";
	}

};

function slider_bt(trun) {
	if (trun == "next") {
		num += 1;
	}

	if (trun == "back") {
		num -= 1;
	}

	if (num < 0) {
		num = 2;
	}

	if (num > 2) {
		num = 0;
	}

	document.getElementById("img_1").src = image_[num];
}
