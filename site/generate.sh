#!/bin/bash

EXAMPLES_FOLDER=../examples

echo -n "" > /tmp/links.txt
for examplePath in $EXAMPLES_FOLDER/*; do
	if [ -d $examplePath ]; then # is a Path?
		exampleName=`basename $examplePath`
		if [ -f $examplePath/README.md ];then
			echo "Achei README"
			cat $examplePath/README.md >> /tmp/page.md
			viewTitle=`pandoc $examplePath/README.md | sed -n -e '1!d;s/[^>]*>\([^<]*\)<.*/\1/p'`
			viewDescription=`pandoc $examplePath/README.md | sed -n -e '2!d;s/[^>]*>\([^<]*\)<.*/\1/p'`
			echo -n "<li><a href=\"$exampleName.html\">$viewTitle</a></li>" >> /tmp/links.txt
		fi
	fi
done

LINKS=$(sed -e 's/[\/&]/\\&/g' /tmp/links.txt)
sed -e "s/___ITENS_MENU___/$LINKS/" navbar.html.template > /tmp/navbar2.html

for examplePath in $EXAMPLES_FOLDER/*; do
	if [ -d $examplePath ]; then # is a Path?
		exampleName=`basename $examplePath`
		echo "" > /tmp/page.md
		echo "Creating page for $exampleName"
		echo "<div class=\"container\">" >> /tmp/page.md
		if [ -f $examplePath/README.md ];then
			echo "Achei README"
			cat $examplePath/README.md >> /tmp/page.md
			viewTitle=`pandoc $examplePath/README.md | sed -n -e '1!d;s/[^>]*>\([^<]*\)<.*/\1/p'`
			viewDescription=`pandoc $examplePath/README.md | sed -n -e '2!d;s/[^>]*>\([^<]*\)<.*/\1/p'`
		fi
		echo "<script type=\"text/javascript\" src=\"../js/codepen.js\"></script>" >> /tmp/page.md
		echo "<script type=\"text/javascript\">codePen('$viewTitle','$viewDescription')</script>" >> /tmp/page.md
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

		for js in $examplePath/*.js; do
			if [ -f $js ]; then
				if [ $js != $examplePath/$exampleName.js ]; then
					echo "<script type=\"text/javascript\" src=\"../$js\"></script>" >> /tmp/page.md
				fi
			fi
		done

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
		pandoc -o examples/$exampleName.html -s -H /tmp/style.css -B /tmp/navbar2.html -A footer.html.template -M pagetitle=$exampleName /tmp/page.md
	fi
done
