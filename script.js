const CURRENT_IP_URL = "https://api.ipify.org?format=json";
const DATA_BY_IP_URL = "https://geo.ipify.org/api/v2/country,city";
const MAP = L.map("display-map", getMapOptions());

function getMapOptions() {
	const mapOptions = {
		center: [0, 0],
		zoomControl: false,
		layers: [
			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				maxZoom: 19,
				attribution: "© OpenStreetMap",
			}),
		],
	};
	return mapOptions;
}

const getIP = async (url) => {
	const res = await fetch(url);
	const data = await res.json();
	return data;
	//return { ip: "8.8.8.8" };
};

const getDataByIP = async (url, ip) => {
	const params = new URLSearchParams();
	params.append("apiKey", "at_BuZcf8byFLF1NU3kdG1aWSPg1ZsB4");
	params.append("ipAddress", ip);
	const res = await fetch(`${url}?${params.toString()}`);
	const data = await res.json();
	return data;
	// return {
	// 	ip: "8.8.8.8",
	// 	location: {
	// 		country: "US",
	// 		region: "California",
	// 		city: "Mountain View",
	// 		lat: 37.40599,
	// 		lng: -122.078514,
	// 		postalCode: "94043",
	// 		timezone: "-07:00",
	// 		geonameId: 5375481,
	// 	},
	// 	domains: [
	// 		"0d2.net",
	// 		"003725.com",
	// 		"0f6.b0094c.cn",
	// 		"007515.com",
	// 		"0guhi.jocose.cn",
	// 	],
	// 	as: {
	// 		asn: 15169,
	// 		name: "Google LLC",
	// 		route: "8.8.8.0/24",
	// 		domain: "https://about.google/intl/en/",
	// 		type: "Content",
	// 	},
	// 	isp: "Google LLC",
	// };
};

const setDataToDOM = async (data) => {
	const { ip, isp, location } = data;
	const { timezone } = location;

	document.getElementById("ip-input").value = ip;
	document.getElementById("info-detail-ip").innerHTML = ip;
	document.getElementById("info-detail-isp").innerHTML = isp;
	document.getElementById("info-detail-timezone").innerHTML = `UTC ${timezone}`;
	document.getElementById("info-detail-location").innerHTML =
		await getLocationInfo(location);
};

const getLocationInfo = async (location) => {
	const { country, city, region, postalCode } = location;
	return [city, region, postalCode, country]
		.filter((x) => x !== undefined && x.toString().length > 0)
		.join(", ");
};

const getMarkerOptions = async (lat, lng) => {
	const markerOptions = {
		title: `Latitude: ${lat},  Longitude: ${lng}`,
		icon: await getCustomMarkerIcon(),
	};
	return markerOptions;
};

const getCustomMarkerIcon = async () => {
	const iconOptions = {
		iconUrl: "images/icon-location.svg",
		iconSize: [45, 55],
	};
	const customIcon = L.icon(iconOptions);
	return customIcon;
};

const updateLocationInMap = async (data, map) => {
	const { location } = data;
	const { lat, lng } = location;
	const center = [lat, lng];

	map.setView(center, 13);

	const marker = L.marker(center, await getMarkerOptions(lat, lng));
	marker.bindPopup(await getLocationInfo(location)).openPopup(); // tooltip type popup on location marker
	marker.addTo(map);
};

const init = async (curr_ip_url, data_by_ip_url, map) => {
	const { ip } = await getIP(curr_ip_url);
	const data = await getDataByIP(data_by_ip_url, ip);
	await setDataToDOM(data);
	await updateLocationInMap(data, map);
};

init(CURRENT_IP_URL, DATA_BY_IP_URL, MAP);

document.getElementById("search-btn").addEventListener("click", async (e) => {
	const data = await getDataByIP(
		DATA_BY_IP_URL,
		document.getElementById("ip-input").value
	);
	await setDataToDOM(data);
	await updateLocationInMap(data, MAP);
	e.stopPropagation();
});
