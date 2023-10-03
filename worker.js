const header0 = {
	headers: {
		'x-rpc-combo_token': '',
		'x-rpc-client_type': '2',
		'x-rpc-app_version': '4.1.0',
		'x-rpc-sys_version': '8.1.0',
		'x-rpc-channel': 'cbu101',
		'x-rpc-device_id': '',
		'x-rpc-device_name': '',
		'x-rpc-device_model': '',
		'x-rpc-app_id': '',
		'Referer': 'https://app.mihoyo.com',
		'Host': 'api-cloudgame.mihoyo.com',
		'Connection': 'Keep-Alive',
		'Accept-Encoding': 'gzip',
		'User-Agent': 'okhttp/4.10.0'
	},
};
const header1 = {
	headers: {
		'x-rpc-combo_token': '',
		'x-rpc-client_type': '2',
		'x-rpc-app_version': '4.1.0',
		'x-rpc-sys_version': '8.1.0',
		'x-rpc-channel': 'mihoyo',
		'x-rpc-device_id': '',
		'x-rpc-device_name': '',
		'x-rpc-device_model': '',
		'x-rpc-app_id': '',
		'Referer': 'https://app.hoyoverse.com',
		'Host': 'sg-cg-api.hoyoverse.com',
		'Connection': 'Keep-Alive',
		'Accept-Encoding': 'gzip',
		'User-Agent': 'okhttp/4.9.0'
    },
};

//云原神签到

function yunys(header, area) {
	return new Promise(async (resolve) => {
		let retmsg;
		try {
			let url;
			switch (area) {
				case 'cn':
					url = "https://api-cloudgame.mihoyo.com/hk4e_cg_cn/wallet/wallet/get";
					break;
				case 'hk':
					url = "https://sg-cg-api.hoyoverse.com/hk4e_global/cg/wallet/wallet/get";
					break;
			}
			
			retmsg = await fetch(url, header)
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
			})
		} catch (err) {
			console.log(err);
			retmsg = "签到接口请求出错";
		}
		resolve("【云原神】：" + retmsg);
	});
}

function pushplus(msg) {
	return new Promise(async (resolve) => {
		try {
			let url = "https://www.pushplus.plus/send"
			let data = {
				"token": '',
				"title": "cf worker签到任务已完成-",
				"content": msg.replace(/\n/g,"<br>"),
				"temple": "html"
			}
			fetch(url, {
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
					console.log("pushplus:发送成功");
				} else {
					console.log("pushplus:发送失败");
					console.log(data.msg);
				}
			})
		} catch (err) {
			console.log("pushplus酱：发送接口调用失败");
			console.log(err);
		}
		resolve();
	});
}

async function handleSchedule(scheduledDate) {
	let msg = "";
	msg += await yunys(header0, 'cn').then((data) => {
		return data + '\n';
	});
	msg += await yunys(header1, 'hk').then((data) => {
		return data + '\n';
	});
	pushplus(msg)
}

addEventListener('scheduled', event => {
	event.waitUntil(
		handleSchedule(event.scheduledTime)
	)
})


async function handleRequest(request) {
    const destinationURL = "https://genshin.hoyoverse.com/en/";
    const statusCode = 301;
    return Response.redirect(destinationURL, statusCode)
}


addEventListener("fetch", async event => {
    event.respondWith(handleRequest(event.request))
})
