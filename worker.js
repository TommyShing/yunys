//multi accounts
const acc_headers = {
	acc_0: {
		area: 'cn',
		headers: {
			'x-rpc-combo_token': '',
			'x-rpc-device_id': '',
			'x-rpc-device_name': '',
			'x-rpc-device_model': '',
			'x-rpc-app_id': '',
		},
	},
	acc_1: {
		area: 'hk',
		headers: {
			'x-rpc-combo_token': '',
			'x-rpc-device_id': '',
			'x-rpc-device_name': '',
			'x-rpc-device_model': '',
			'x-rpc-app_id': '',
		},
	}
};
const stac_headers = {
	default: {
		'x-rpc-client_type': '2',
		'x-rpc-app_version': '4.1.0',
		'x-rpc-sys_version': '8.1.0',
		'x-rpc-channel': 'mihoyo',
		'Connection': 'Keep-Alive',
		'Accept-Encoding': 'gzip',
	},
	cn: {
		'Referer': 'https://app.mihoyo.com',
		'Host': 'api-cloudgame.mihoyo.com',
		'User-Agent': 'okhttp/4.10.0'
	},
	hk: {
		'Referer': 'https://app.hoyoverse.com',
		'Host': 'sg-cg-api.hoyoverse.com',
		'User-Agent': 'okhttp/4.9.0'
	}
};

const urls = {
	cn: "https://api-cloudgame.mihoyo.com/hk4e_cg_cn/wallet/wallet/get",
	hk: "https://sg-cg-api.hoyoverse.com/hk4e_global/cg/wallet/wallet/get"
}
//云原神签到

function yunys() {
	return new Promise(async (resolve) => {
		let retmsg = "";
		try {
			for (const acc in acc_headers) {
				let area = acc_headers[acc].area;
				let url = urls[area];
				retmsg += "【云原神】：";
				retmsg += await fetch(url, {
					method: "GET",
					headers: Object.assign(acc_headers[acc].headers, stac_headers.default, stac_headers[area])
				})
					.then(res => {
						if (res.ok) {
							return res.json()
						}
					})
					.then(data => {
						if (data.retcode == 0) {
							retmsg = `签到成功! 账号${area}剩余总时间为${data.data.free_time.free_time}分钟`;
						} else {
							retmsg = data.error_msg;
						}
						return retmsg;
					}) + '\n';
			}
		} catch (err) {
			console.log(err);
			retmsg = "签到接口请求出错";
		}
		resolve(retmsg);
	});
}

function pushplus(msg) {
	return new Promise(async (resolve) => {
		let retmsg;
		try {
			let url = "https://www.pushplus.plus/send"
			let data = {
				// @ts-ignore
				"token": TOKEN,
				"title": "cf worker签到任务已完成-",
				"content": msg.replace(/\n/g, "<br>"),
				"temple": "html"
			}
			retmsg = await fetch(url, {
				method: 'POST',
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(data),
			})
				.then(res => {
					if (res.ok) {
						return res.json()
					}
				})
				.then(data => {
					if (data.code == 200) {
						retmsg = "pushplus:发送成功";
					} else {
						retmsg = "pushplus:发送失败\n" + data.msg;
					}
					return retmsg;
				})
		} catch (err) {
			retmsg = "pushplus酱：发送接口调用失败\n" + err;
		}
		resolve(retmsg);
	});
}
//使用名为LOG的namespace作为KV存储
// @ts-ignore
const setmsg = (key, data) => LOG.put(key, data)
// @ts-ignore
const getmsg = key => LOG.get(key)

async function handleSchedule(scheduledDate) {
	let msg = "";
	msg = await yunys().then((data) => {
		return data + '\n';
	});
	msg += await pushplus(msg).then((data) => {
		return data + '\n';
	});
	await setmsg('msg', msg.replace(/\n/g, "<br>"));
}

addEventListener('scheduled', event => {
	event.waitUntil(
		handleSchedule(event.scheduledTime)
	)
})


async function handleRequest(request) {
	const html = `
	<!DOCTYPE html>
	<html>
	<head><title>Genshin Claim Worker</title>
		<style>
			body {
				background-color: tan;
			}
			a {
				text-decoration: none;
				font-family: hanyi;
			}
			#container {
				display: flex;
				flex-wrap: wrap;
			}
			#container > div {
				font-size: 20px;
				margin: 20px;
				padding: 20px;
				border-radius: 10px;
				width: auto;
				max-width: 273.15px;
				text-align: center;
			}
			#container > div > a {
				color: rgb(255,247,241);
			}
			.logo {
				padding: 5px;
				height: auto;
				width: 90%;
			}
		</style>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
	</head>
	<body>
		<div id="container">
			<div style="background-color: rgb(222,219,249)">
				<a target="_blank" href="https://ys.mihoyo.com/">
					<img class="logo" src="https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_FJYZwhyyGI/resource/puzzle/2023/09/19/d8f84cd7005b80f48ddb66dae1aa21ea_7231267847935090789.png?x-oss-process=image/format,webp/quality,Q_90" alt="原神logo.png">
					原神
				</a>
			</div>
			<div style="background-color: rgb(157,184,241)">
				<a target="_blank" href="https://mhyy.mihoyo.com/">
					<img class="logo" src="https://fastcdn.mihoyo.com/content-v2/clgm/101308/91e0e8054570be2d3990842743cfc6ea_6169415185580836640.png" alt="云原神logo.png">
					云原神
				</a>
			</div>
			<div style="background-color: rgb(149,77,129)">
				<a target="_blank" href="https://genshin.hoyoverse.com/en/">
					<img class="logo" src="https://fastcdn.hoyoverse.com/mi18n/hk4e_global/m20230919hy36d3ruv4/upload/759d18cddf8cbe6dd6ec07c2b75981cc_8295841605612471990.png?x-oss-process=image/format,webp/quality,Q_90" alt="genshin_logo.png">
					Genshin Impact
				</a>
			</div>
		</div>
	<div>${await getmsg('msg')}</div>
	</body>
	</html>
	`
	return new Response(html, {
		headers: { 'content-type': 'text/html; charset=utf-8' },
	})
}


addEventListener("fetch", async event => {
	event.respondWith(handleRequest(event.request))
})
