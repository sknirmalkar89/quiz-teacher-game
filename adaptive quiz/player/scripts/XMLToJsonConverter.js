var parser = require("xml2json")

var fs = require("fs")

exports.xml2json = function (input, output) {
	fs.readFile(input, function (err, data) {
		if (!err) {
			var json = parser.toJson(data, {sanitize: false})
			fs.writeFileSync(output, json)
		} else {
			console.log("Error:", err)
		}
	})
}

exports.xml2json("../www/worksheets/worksheet1/markup.xml", "../www/worksheets/worksheet1/markup.json")
