const searchParams = new URLSearchParams(location.search);

let isDay = false;
let busToChk = searchParams.get('bus') || "80";
let stop = searchParams.get('stop') || "새암공원";

const pty = {
	"0": "RAIN",
	"1": "RAIN",
	"2": "RAIN, SNOW",
	"3": "SNOW",
	"5": "RAIN",
	"6": "RAIN, SNOW",
	"7": "SNOW",
};

const sky = {
	"1": "SUNNY",
	"3": "CLOUDY",
	"4": "FADE",
};

const commonWeather = {
	minTmp: "",
	maxTmp: "",
}
const weathers = {};

const changeToNight = () => {
	document.documentElement.className = "dark";
};
const changeToDay = () => {
	document.documentElement.className = "light";
};

/*
POP - 강수확률 - %
PTY - 강수형태 - 코드값
- 강수형태(PTY) 코드 : (초단기) 없음(0), 비(1), 비/눈(2), 눈(3), 빗방울(5), 빗방울눈날림(6), 눈날림(7) 
PCP - 1시간 강수량 - 범주 (1 mm)
REH - 습도 - %
SKY - 하늘상태 - 코드값
- 하늘상태(SKY) 코드 : 맑음(1), 구름많음(3), 흐림(4)
TMN - 일 최저기온 - ℃
TMX - 일 최고기온 - ℃
*/

const getWeather = () => {
	const date =  new Date();
	
	const base_times = ["0200", "0500", "0800", "1100", "1400", "1700", "2000", "2300"];
	const idx = (Math.floor((date.getHours() + 1) / 3) + 7) % 8;

	const base_date = `${date.getFullYear()}${(date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1)}${(date.getDate() <= 9 ? "0" : "") + date.getDate()}`;
	const base_time = base_times[idx];

	console.log(base_date)
	console.log(base_time);
	var xhr = new XMLHttpRequest();
	var url = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst'; /*URL*/
	var queryParams = '?' + encodeURIComponent('serviceKey') + '='+'Xm8JMazwsEBSMrl3re23y%2FTJbo5nvUG1LsYeNx7mpOaPLS5lXotXFm7x%2FjozwC4XGLHi4Hg%2BRlOLD90opRcuZw%3D%3D'; /*Service Key*/
	queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /**/
	queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1000'); /**/
	queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('XML'); /**/
	queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(base_date); /**/
	queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(base_time); /**/
	queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent(searchParams.get('nx') || 55); /**/
	queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent(searchParams.get('ny') || 125); /**/
	
	const req = $.ajax({
		url: url + queryParams,
	});
	req.done((data) => {
		console.log(data);
		
		const root = $(data);
		const items = root.find("items")[0].children;
		
		for (const item of items) {
			const time = $(item).find("fcstTime").text();
			const weatherInfo = weathers[time] || {
				tmp: 0,
				sky: "맑음",
				rain: {
					possibillity: 0,
					type: 0,
					amount: 0,
				},
				hum: 0,
			};
		

			switch($(item).find("category").text()) {
				case "POP" : // 강수확률
					weatherInfo.rain.possibillity = $(item).find("fcstValue").text() + "%";
					break;
				case "PTY" : // 강수형태
					weatherInfo.rain.type = pty[$(item).find("fcstValue").text()];
					break;
				case "PCP" : // 강수량
					weatherInfo.rain.amount = $(item).find("fcstValue").text() == "강수없음" ? "00" : $(item).find("fcstValue").text();
					break;
				case "REH" : // 습도
					weatherInfo.hum = $(item).find("fcstValue").text() + "%";
					break;
				case "SKY" : // 하늘상태
					weatherInfo.sky = sky[$(item).find("fcstValue").text()];
					break;
				case "TMN" : // 최저기온
					commonWeather.minTmp = $(item).find("fcstValue").text() + "℃";
					break;
				case "TMX" : // 최고기온
					commonWeather.maxTmp = $(item).find("fcstValue").text() + "℃";
					break;
				case "TMP" : // 현재기온
					weatherInfo.tmp = $(item).find("fcstValue").text() + "℃";
					break;
			}
			weathers[$(item).find("fcstTime").text()] = weatherInfo;
		}

		console.log(weathers);
	});
	
	// xhr.open('GET', url + queryParams);
	// xhr.onreadystatechange = function () {
	// 	if (this.readyState == 4) {
	// 		console.log(this.responseText);
	// 	}
	// };

	// xhr.send('');
}

const getWeatherIdx = (hour) => {
	const weatherIdx = `${(hour <= 9 ? "0" : "") + (hour)}00`;
	return weatherIdx;
};

const makeWeather = (weatherInfo, hour) => {
	return `
	<div class="weather-header">
		<span>${weatherInfo.sky}</span>
		<span>${ getWeatherIdx(hour).slice(0, 2) }</span>
		<span> : </span>
		<span>${ getWeatherIdx(hour).slice(2, 4) }</span>
	</div>
	<div class="tmp">
		<span>TMP : ${weatherInfo.tmp} (</span> 
		<span>${commonWeather.maxTmp}</span> 
		<span>/</span> 
		<span>${commonWeather.minTmp}</span> 
		<span>)</span>
		<br>
		<span>HUM : ${weatherInfo.hum}</span>
	</div>
	<div class="rain">
		<span>${weatherInfo.rain.possibillity} of </span>
		<span>${weatherInfo.rain.type}</span>
		<span>|</span>
		<span>${weatherInfo.rain.amount}(mm/h)</span>
	</div>`;
};

const getStopIds = async (keyword) => {
	let result;

	var url = "https://www.gbis.go.kr/gbis2014/schBusAPI.action";
	var data = 'cmd=searchAllJson';
	data += '&searchKeyword=' + keyword; // 새암공원
	data += '&pageOfRoute=' + 1; // 1
	data += '&pageOfBus=' + 1; // 1
	data += '&pageOfSubway=' + 1; // 1
	data += '&pageOfPOI=' + 1;
	data += '&routeNameType=' + "string"; // string

	await $.ajax({
		type: "post",
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		dataType: "json",
		url: url,
		data: data,
		success: (data) => {
			result = data.result.busStation.list
		},
		error: (err) => {
			result = undefined;
		},
	});
	return result;
};

const getBus = async (id) => {
	var url = "https://www.gbis.go.kr/gbis2014/schBusAPI.action";
	var data = 'cmd=searchBusStationJson';
	data += '&stationId=' + id;

	let result;
	
	await $.ajax({
		type: "post",
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		dataType: "json",
		url: url,
		data: data,
		success: (data) => {
			result = data;
		},
		error: (err) => {
			console.log(err);
		}
	});

	return result;
}

$(document).ready(() => {
	// changeToDay();
	changeToNight();
	getWeather();

	const timeColors = [
		"#544EEF", // 0
		"#8D35C7", // 1
		"#E44DCA", // 2
		"#E44E4E", // 3
		"#E4A84E", // 4
		"#E4E44E", // 5
		"#E4E44E", // 6
		"#E4A84E", // 7
		"#E44E4E", // 8
		"#E44DCA", // 9
		"#8D35C7", // 10
		"#544EEF", // 11
	];
	const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	let timeColor = "red";


	setInterval(getWeather, 1000 * 3600 * 3);

	setInterval(async () => {
		const stops = await getStopIds(stop);
		const finalInfo = [];

		if (stops.length == 0) {
			return;
		}

		for (const stop of stops) {
			console.log();

			const result = (await getBus(stop.stationId)).result;
			const arrivalInfo = result.busArrivalInfo;
			const stationInfo = result.busStationInfo;

			const midInfo = [];

			for (let idx = 0; idx < arrivalInfo.length; idx++) {
				const info = {
					routeName: arrivalInfo[idx].routeName,
					predictTime1: arrivalInfo[idx].predictTime1,
					routeDestName: arrivalInfo[idx].routeDestName,
				};

				midInfo.push(info);
			}
			finalInfo.push(midInfo);
		}

		finalInfo.forEach((stopInfo, idx) => {
			stopInfo.forEach(bus => {
				if (bus.routeName == busToChk) {
					$("#bus-num").html(busToChk);
					$(".bus-dest").eq(idx).html(bus.routeDestName);
					$(".bus-remain").eq(idx).html(bus.predictTime1 ? bus.predictTime1 + "분" : "도착 정보 없음");
				}
			});
		});
	}, 3000);

	setInterval(() => {
		const date = new Date();
		const h = date.getHours() % 24;

		try {
			const currentWeather = weathers[getWeatherIdx(date.getHours())];
			const foreWeather = weathers[getWeatherIdx(date.getHours() + 1)];
			const foreWeather2 = weathers[getWeatherIdx(date.getHours() + 8)];
	
			$("#current-weather").html(makeWeather(currentWeather, date.getHours()));
			if (foreWeather) {
				$("#fore-weather").html(makeWeather(foreWeather, date.getHours() + 1));
			} else {
				$("#fore-weather").html("");
			}
			if (foreWeather2) {
				$("#fore-weather2").html(makeWeather(foreWeather2, date.getHours() + 8));
			} else {
				$("#fore-weather2").html("");
			}
		} catch(e) {

		}
		

		if (isDay) {
			if (h < 7 || h > 21) {
				isDay = !isDay;
				changeToNight();
			}
		} else {
			if (h >= 7 && h <= 21) {
				isDay = !isDay;
				changeToDay();
			}
		}

		let week = WEEKDAY[date.getDay()];

		timeColor = timeColors[Math.floor((date.getHours() % 24) / 2)];
		

		$("#time-area").css({
			color: timeColor,
		});

		$("#time-area").html(
			`${date.getHours().toString().padStart(2, "0")} <span style="color: ${timeColor}">:</span> ${date.getMinutes().toString().padStart(2, "0")} <span style="color: ${timeColor}">:</span> ${date.getSeconds().toString().padStart(2, "0")}`
		);
		$("#date-area").html(
			`${week} / ${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")}`
		);
	}, 1000);
});