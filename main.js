let isDay = false;

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

const weathers = {};

const changeToNight = () => {
	const root = $(":root")[0];
	root.style.setProperty("--main-font-color", "rgb(165, 107, 107)");
	root.style.setProperty("--main-bg-color", "rgb(12, 15, 18)");
	root.style.setProperty("--main-div-bg-color", "rgb(43, 29, 46)");
	root.style.setProperty("--weather-min-tmp", "rgb(78, 103, 161)");
	root.style.setProperty("--weather-max-tmp", "rgb(164, 50, 50)");
};
const changeToDay = () => {
	const root = $(":root")[0];
	root.style.setProperty("--main-font-color", "gray");
	root.style.setProperty("--main-bg-color", "aliceblue");
	root.style.setProperty("--main-div-bg-color", "rgb(220, 230, 238)");
	root.style.setProperty("--weather-min-tmp", "rgb(94, 136, 234)");
	root.style.setProperty("--weather-max-tmp", "rgb(242, 73, 73)");
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
	const searchParams = new URLSearchParams(location.search);

	const date =  new Date();
	
	const base_times = ["0200", "0500", "0800", "1100", "1400", "1700", "2000", "2300"];
	const idx = (Math.floor((date.getHours() + 1) / 3) + 7) % 8;

	const base_date = `${date.getFullYear()}${(date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1)}${(date.getDate() <= 9 ? "0" : "") + date.getDate()}`;
	const base_time = base_times[idx];

	console.log(base_date)
	console.log(base_time);
	var xhr = new XMLHttpRequest();
	var url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst'; /*URL*/
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
		
		const weatherInfo = {
			minTmp: 0,
			maxTmp: 0,
			tmp: 0,
			sky: "맑음",
			rain: {
				possibillity: 0,
				type: 0,
				amount: 0,
			},
			hum: 0,
		};

		for (const item of items) {
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
					weatherInfo.minTmp = $(item).find("fcstValue").text() + "℃";
					break;
				case "TMX" : // 최고기온
					weatherInfo.maxTmp = $(item).find("fcstValue").text() + "℃";
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

	setInterval(() => {
		const date = new Date();
		
		const h = date.getHours() % 24;

		const getWeatherIdx = (hour) => {
			const weatherIdx = `${(hour <= 9 ? "0" : "") + (hour)}00`;
			return weatherIdx;
		};

		const currentWeather = weathers[getWeatherIdx(date.getHours())];
		const foreWeather = weathers[getWeatherIdx(date.getHours() + 1)];
		const foreWeather2 = weathers[getWeatherIdx(date.getHours() + 8)];

		$("#current-weather").html(`
		<div class="weather-header">
			<span>${currentWeather.sky}</span>
			<span>${ getWeatherIdx(date.getHours()).slice(0, 2) }</span>
			<span> : </span>
			<span>${ getWeatherIdx(date.getHours()).slice(2, 4) }</span>
		</div>
		<div class="tmp">
			<span>TMP : ${currentWeather.tmp} (</span> 
			<span>${currentWeather.maxTmp}</span> 
			<span>/</span> 
			<span>${currentWeather.minTmp}</span> 
			<span>)</span>
		</div>
		<div class="rain">
			<span>${currentWeather.rain.possibillity} of </span>
			<span>${currentWeather.rain.type}</span>
			<span>|</span>
			<span>${currentWeather.rain.amount}(mm/h)</span>
		</div>
		`);
		if (foreWeather) {
			$("#fore-weather").html(`
			<div class="weather-header">
				<span>${foreWeather.sky}</span>
				<span>${ getWeatherIdx(date.getHours() + 1).slice(0, 2) }</span>
				<span> : </span>
				<span>${ getWeatherIdx(date.getHours() + 1).slice(2, 4) }</span>
			</div>
			<div class="tmp">
				<span>TMP : ${foreWeather.tmp} (</span> 
				<span>${foreWeather.maxTmp}</span> 
				<span>/</span> 
				<span>${foreWeather.minTmp}</span> 
				<span>)</span>
			</div>
			<div class="rain">
				<span>${foreWeather.rain.possibillity} of </span>
				<span>${foreWeather.rain.type}</span>
				<span>|</span>
				<span>${foreWeather.rain.amount}(mm/h)</span>
			</div>
			`);
		} else {
			$("#fore-weather").html("");
		}
		if (foreWeather2) {
			$("#fore-weather2").html(`
			<div class="weather-header">
				<span>${foreWeather2.sky}</span>
				<span>${ getWeatherIdx(date.getHours() + 8).slice(0, 2) }</span>
				<span> : </span>
				<span>${ getWeatherIdx(date.getHours() + 8).slice(2, 4) }</span>
			</div>
			<div class="tmp">
				<span>TMP : ${foreWeather2.tmp} (</span> 
				<span>${foreWeather2.maxTmp}</span> 
				<span>/</span> 
				<span>${foreWeather2.minTmp}</span> 
				<span>)</span>
			</div>
			<div class="rain">
				<span>${foreWeather2.rain.possibillity} of </span>
				<span>${foreWeather2.rain.type}</span>
				<span>|</span>
				<span>${foreWeather2.rain.amount}(mm/h)</span>
			</div>
			`);
		} else {
			$("#fore-weather2").html("");
		}

		// if (isDay) {
		// 	if (h < 7 || h > 21) {
		// 		isDay = !isDay;
		// 		changeToNight();
		// 	}
		// } else {
		// 	if (h > 7 && h < 21) {
		// 		isDay = !isDay;
		// 		changeToDay();
		// 	}
		// }

		let week = WEEKDAY[date.getDay()];

		timeColor = timeColors[Math.floor((date.getHours() % 24) / 2)];
		

		$("#time-area").css({
			color: timeColor,
		});

		$("#time-area").html(
			`${date.getHours()} <span style="color: ${timeColor}">:</span> ${date.getMinutes()} <span style="color: ${timeColor}">:</span> ${date.getSeconds()}`
		);
		$("#date-area").html(
			`${week} / ${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
		);
	}, 1000);
});