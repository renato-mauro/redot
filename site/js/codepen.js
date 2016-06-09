var urlBase = "http://renato-mauro.github.io/redot/"

var formData = {
	"editors": "001",
	"layout": "top",
	"private": false,
	"html" : '<div id="main"></div>',
	"js_external" : urlBase + 'redot.js'
}

function codePenFillData(form)
{
	formData.js = "";
	formData.css = "";

	var script = document.getElementById("theScript");
	if(script)
	{
		formData.js = script.textContent.trim();
	}

	var style = document.getElementById("theStyle");
	if(style)
	{
		formData.css = style.textContent.trim();
	}

	form.data.value = JSON.stringify(formData);
	return true;
}

function codePen(title,description,extraPath)
{
	formData.title = title;
	formData.description = description;
	formData.js_external += extraPath;
	document.write('<form method="post" action="http://codepen.io/pen/define" onsubmit="return codePenFillData(this)" target="_blank">');
	document.write('<input type="hidden" name="data" value=""/>');
	document.write('<input type="submit" class="btn btn-primary" value="Edit\'n Play in CodePen"/>');
	document.write('</form>');
}
