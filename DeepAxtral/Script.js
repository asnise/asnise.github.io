var log;
var data_load;
var data_load_body = "";
var update_log = [];
var das_spit = [];
var log_body = "";

$(document).ready(function () {
	$.getJSON("https://api.countapi.xyz/hit/asnise.github.io/visits", function (response) {
		$("#visits").text("จำนวนเข้าชม : " + response.value);
	});

	$.ajax({
		url: 'https://api.github.com/repos/asnise/NPC-Ann-SDV/releases/latest',
		format: 'json',
		dataType: "json",
		success(data) {
			data_load = data;
			data_load_body = data_load.body.toString();
			update_log = data_load_body.split("---");
			let version = $('<h4>').text("Ann In Stardew Version " + data.tag_name);
			$('#ver')
				.append(version);
		}
	});
});

function cansel_win(idtag, name, content) {
	var win_alert = document.getElementById(idtag);
	if (win_alert.style.display === "block") {
		win_alert.style.display = "none";
	}
	else {
		win_alert.style.display = "block";
	}
	if (content == "log") {
		das_spit = update_log[0].split("-");

		for(item in das_spit)
		{
			item =  "-" + das_spit[item] + "<br>";
			log_body += item;
		}

		document.getElementById("content_mod").innerHTML = log_body.replace("-มีอะไรใหม่?", "");
	}
	else {
		document.getElementById("content_mod").innerHTML = content;
	}
	document.getElementById("title_name").innerHTML = name;

}
