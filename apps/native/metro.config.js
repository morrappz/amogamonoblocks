const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver = {
	...config.resolver,

	// Supabase workaround
	unstable_conditionNames: ["browser"],
	unstable_enablePackageExports: false,

	// Redirect metro-runtime's empty module to our stub
	extraNodeModules: {
		...(config.resolver.extraNodeModules || {}),
		"metro-runtime/src/modules/empty-module.js": path.join(
			__dirname,
			"emptyModule.js",
		),
	},

	// Tell Metro what to use as its empty module
	emptyModulePath: path.join(__dirname, "emptyModule.js"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
