#!/bin/bash

EXAMPLES_FOLDER=../examples

function navBarTemplate {
	echo '
		<nav class="navbar navbar-default">
		  <div class="container-fluid">
		    <div class="navbar-header">
		      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
		        <span class="sr-only">Toggle navigation</span>
		        <span class="icon-bar"></span>
		        <span class="icon-bar"></span>
		        <span class="icon-bar"></span>
		      </button>
		      <a class="navbar-brand" href="#">REDOT</a>
		    </div>
		    <div id="navbar" class="navbar-collapse collapse">
		      <ul class="nav navbar-nav">
		        <li><a href="#">Home</a></li>
		        <li><a href="#">Tutorial</a></li>
		        <li><a href="#">Download</a></li>
		        <li class="dropdown">
		          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Examples <span class="caret"></span></a>
		          <ul class="dropdown-menu">
	' > /tmp/begin.html

	for examplePath in $EXAMPLES_FOLDER/*; do
		if [ -d $examplePath ]; then # is a Path?
			exampleName=`basename $examplePath`
			if [ -f $examplePath/README.md ];then
				viewTitle=`pandoc $examplePath/README.md | sed -n -e '1!d;s/[^>]*>\([^<]*\)<.*/\1/p'`
				viewDescription=`pandoc $examplePath/README.md | sed -n -e '2!d;s/[^>]*>\([^<]*\)<.*/\1/p'`
				echo "<li><a href=\"$exampleName.html\">$viewTitle</a></li>" >> /tmp/begin.html
			fi
		fi
	done

	echo '
		          </ul>
		        </li>
		      </ul>
		    </div><!--/.nav-collapse -->
		  </div><!--/.container-fluid -->
		</nav>
	' >> /tmp/begin.html
}

function fiddleForm {
	echo '
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
		<script src="../js/bootstrap.min.js"></script>
		<script>
			var firstClick = true;
			function jsfiddle(title,description,extrajs)
			{
				var form = document.getElementById("fiddleForm");
				if(firstClick)
				{
					form.title.value = title;
					form.description.value = description;
					form.html.value = "<div id=\"main\"></div>";
					var script = document.getElementById("theScript");
					if(script)
					{
						form.js.value = script.textContent.trim();
					}

					var style = document.getElementById("theStyle");
					if(style)
					{
						form.css.value = style.textContent.trim();
					}
					if(extrajs)
					{
						firstClick = false;
						form.resources.value += extrajs;
					}
				}
				form.submit();
			}
		</script>
		<form id="fiddleForm" method="POST" action="http://jsfiddle.net/api/post/library/pure/" target="_bkank">
			<input type="hidden" name="html" value=""/>
			<input type="hidden" name="js" value=""/>
			<input type="hidden" name="css" value=""/>
			<input type="hidden" name="panel_html" value="0"/>
			<input type="hidden" name="panel_js" value="0"/>
			<input type="hidden" name="panel_css" value="0"/>
			<input type="hidden" name="resources" value="http://renato-mauro.github.io/redot/redot.js"/>
			<input type="hidden" name="title" value=""/>
			<input type="hidden" name="description" value=""/>
			<input type="hidden" name="normalize_css" value="no"/>
			<input type="hidden" name="dtd" value="html 4"/>
			<input type="hidden" name="wrap" value="b"/>
		</form>' > /tmp/end.html
}

navBarTemplate
fiddleForm

for examplePath in $EXAMPLES_FOLDER/*; do
	if [ -d $examplePath ]; then # is a Path?
		exampleName=`basename $examplePath`
		echo "" > /tmp/page.md
		echo "Creating page for $exampleName"
		EXTERNAL_JS=""
		for js in $examplePath/*.js; do
			if [ -f $js ]; then
				if [ $js != $examplePath/$exampleName.js ]; then
					echo "<script type=\"text/javascript\" src=\"../$js\"></script>" >> /tmp/page.md
					EXTERNAL_JS="$EXTERNAL_JS,http://renato-mauro.github.io/redot/site/$js"
					echo "====================> $EXTERNAL_JS"
				fi
			fi
		done

		echo "<div class=\"container\">" >> /tmp/page.md
		if [ -f $examplePath/README.md ];then
			echo "Achei README"
			cat $examplePath/README.md >> /tmp/page.md
			viewTitle=`pandoc $examplePath/README.md | sed -n -e '1!d;s/[^>]*>\([^<]*\)<.*/\1/p'`
			viewDescription=`pandoc $examplePath/README.md | sed -n -e '2!d;s/[^>]*>\([^<]*\)<.*/\1/p'`
		fi
		echo "<button onclick=\"jsfiddle('$viewTitle','$viewDescription','$EXTERNAL_JS')\">Open in JSFiddle</button>" >> /tmp/page.md
		echo "<div id=\"main\" style=\"margin:10px 0;\"></div>" >> /tmp/page.md
		echo "<link href=\"../css/bootstrap.min.css\" rel=\"stylesheet\">" > /tmp/style.css
		echo "<style type=\"text/css\">" >> /tmp/style.css
		echo "td.lineNumbers {width:60px;}" >> /tmp/style.css
		echo "</style>" >> /tmp/style.css
		echo "<style id=\"theStyle\">" >> /tmp/style.css
		FLAG_CSS="FALSE"
		for css in $examplePath/*.css; do
			if [ -f $css ]; then
				echo "Achei CSS $css"
				if [ $FLAG_CSS = "FALSE" ]; then
					echo "## CSS (`basename $css`)" >> /tmp/page.md
					FLAG_CSS="TRUE"
				else
					echo "### `basename $css`" >> /tmp/page.md
				fi
				echo "~~~~ {.css .numberLines}" >> /tmp/page.md
				cat $css >> /tmp/page.md
				echo "" >> /tmp/page.md
				echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~" >> /tmp/page.md
				cat $css >> /tmp/style.css
			fi
		done
		echo "</style>" >> /tmp/style.css

		if [ -f $examplePath/$exampleName.js ]; then
			echo "Achei JS"
			echo "## Javascript" >> /tmp/page.md
			echo "" >> /tmp/page.md
			echo "~~~~ {.javascript .numberLines}" >> /tmp/page.md
			cat $examplePath/$exampleName.js >> /tmp/page.md
			echo "" >> /tmp/page.md
			echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~" >> /tmp/page.md
			echo "" >> /tmp/page.md
			echo "<script type=\"text/javascript\" src=\"../../redot.js\"></script>" >> /tmp/page.md
			echo "<script type=\"text/javascript\" id=\"theScript\">" >> /tmp/page.md
			cat $examplePath/$exampleName.js >> /tmp/page.md
			echo "" >> /tmp/page.md
			echo "</script>" >> /tmp/page.md
		fi
		for json in $examplePath/*.json; do
			if [ -f $json ]; then
				echo "Achei JSON $json"
			fi
		done
		echo "</div>" >> /tmp/page.md		
		cp /tmp/page.md /tmp/$exampleName.md
		pandoc -o examples/$exampleName.html -s -H /tmp/style.css -B /tmp/begin.html -A /tmp/end.html -M pagetitle=$exampleName /tmp/page.md
	fi
done
