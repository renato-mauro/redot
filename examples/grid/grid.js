redot.include("grid.css");

function Grid()
{
    this.width    = document.body.clientWidth;
    this.height   = document.body.clientHeight;
    this.rowHeight = "{this.height/data.length}";
       
    /*******************************************************
    <svg width="{width}" height="{height}">
        <include template="Rows" data="{data}" />
    </svg>
    ********************************************************/
}

function Rows()
{
    this.width    = "{parent.width}";
    this.height   = "{parent.rowHeight}";
    this.colWidth = "{parent.width/data.length}";

    /***************************************************************
    <g class="row" transform="translate(0 {i*height})">
        <include template="Cells" data="{data}" />
    </g>
    ***************************************************************/
}

function randomColor()
{
    var r = ~~(Math.random()*255);
    var g = ~~(Math.random()*255);
    var b = ~~(Math.random()*255);
    return "rgb("+r+","+g+","+b+")";
}

function Cells(d,i)
{
    this.width  = "{parent.colWidth}";
    this.height = "{parent.height}";

    /**********************************************************************************************
    <g class="cell" transform="translate({i*width} 0)">
        <rect x="0" y="0" width="{width}" height="{height}" fill="{randomColor()}"/>
        <text x="{width/2}" y="{height/2}" text-anchor="middle" style="dominant-baseline: middle">{data.celula}</text>
    </g>
    **********************************************************************************************/
}

var data = [];
var k = 1;
for(var i=0; i<50; i++)
{
    var row = [];
    data.push(row);
    for(j=0; j<50; j++)
    {
        row.push({celula:k++});
    }
}

redot.applyTemplate("#main", Grid, data);
