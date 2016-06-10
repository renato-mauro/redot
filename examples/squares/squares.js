var data = [];
for(var i=0; i<20; i++) // sample with 20 elements
{
    var obj = { };
    obj.a = parseInt(Math.random()*40)+10;
    obj.b = parseInt(Math.random()*40)+10;
    obj.c = parseInt(Math.random()*40)+10;
    data.push(obj);
}

data.select = function(attributeName)
{
    this.sort(function(a,b){return b[attributeName]-a[attributeName]});
    for(var i=0; i<this.length; i++)
    {
        this[i].value = this[i][attributeName];
    }
    redot.changed(this);
}

data.select('a');

function SquareChart()
{
    this.width    = 1024;
    this.height   = 300;
    
    /**********************************************************************************
    <div>
        <svg width="{width+50}" height="{height+50}" style="border: 1px black solid;">
            <g transform="translate(25 {25+height/2})">
                <include template="{Square}" data="{d}" />
            </g>
        </svg>
    </div>
    <div>
        <button onclick="{d.select('a')}">Show A</button>
        <button onclick="{d.select('b')}">Show B</button>
        <button onclick="{d.select('c')}">Show C</button>
    </div>
    ********************************************************************************/
}

function Square()
{    
    this.squareRangeOdd = redot.stack("{(i==0||i%2==1)?d.value:0}");
    this.squareRangeEven = redot.stack("{i%2==0?d.value:0}");

    this.relativeStart = "{i%2==0?squareRangeEven.begin:squareRangeOdd.begin}";
    this.relativeEnd = "{i%2==0?squareRangeEven.end:squareRangeOdd.end}";

    this.x = "{relativeStart}";
    this.width = "{(relativeEnd-relativeStart)}";
    this.y = "{i==0?(-width/2):(i%2==0?0:-width)}";    
    
    /***********************************************************************************
    <g class="square" style="transform:translate({x}px,{y}px);">
        <rect x="2" y="2" height="{width-4}" width="{width-4}"/>
    </g>
    ***********************************************************************************/
}

redot.applyTemplate("#main", SquareChart, data);
