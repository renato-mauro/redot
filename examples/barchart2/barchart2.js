redot.include("barchart2.css");

function pieSlice01(radius, range)
{
    var startAngle = range.begin;
    var endAngle = range.end;
    var p1x = Math.cos(startAngle*2*Math.PI)*radius;
    var p1y = -Math.sin(startAngle*2*Math.PI)*radius;
    var p2x = Math.cos(endAngle*2*Math.PI)*radius;
    var p2y = -Math.sin(endAngle*2*Math.PI)*radius;
    var largeAngleFlag = endAngle-startAngle > 0.5 ? 1 : 0;
    return ["M0 0L",p1x," ",p1y,"A",radius,",",radius," 0 ", largeAngleFlag, " 0 ",p2x," ",p2y,"z"].join("");
}

function donutSlice01(r1, r2, range)
{
    var startAngle = range.begin;
    var endAngle = range.end;    
    var p1x = Math.cos(startAngle*2*Math.PI)*r1;
    var p1y = -Math.sin(startAngle*2*Math.PI)*r1;
    var p2x = Math.cos(endAngle*2*Math.PI)*r1;
    var p2y = -Math.sin(endAngle*2*Math.PI)*r1;
    var p3x = Math.cos(startAngle*2*Math.PI)*r2;
    var p3y = -Math.sin(startAngle*2*Math.PI)*r2;
    var p4x = Math.cos(endAngle*2*Math.PI)*r2;
    var p4y = -Math.sin(endAngle*2*Math.PI)*r2;
    var largeAngleFlag = endAngle-startAngle > 0.5 ? 1 : 0;
    return ["M",p1x," ",p1y,"A",r1,",",r1," 0 ", largeAngleFlag, " 0 ",p2x," ",p2y,"L",p4x," ",p4y,"A",r2,",",r2," 0 ", largeAngleFlag, " 1 ",p3x," ",p3y, "z"].join("");
}


function GraficoDeBarras()
{    
    this.width    = 1024;
    this.height   = 200;
    this.barWidth = "{width/d.length}";

    /*******************************************************
    <div>
        <p>{width}, {d.length}, {barWidth}</p>
        <svg width="{width+50}" height="{height+50}">
            <g transform="translate(25,25)">
                <include template="Barra" data="{d}" />
            </g>
            <g style="transform:translate({width/4}px,{height/2}px)">
                <include template="Barra2" data="{d}" />
            </g>
        </svg>
    </div>
    ********************************************************/
}

function Barra()
{
    this.maxQtd = redot.agregate.max("{value}");
    this.range = redot.stack("{value}");

    this.yScale = "{parent.height/maxQtd}";
    this.color  = "orange";
    this.width  = "{parent.barWidth}";
    this.height = "{yScale*d.qtd}";
    this.x      = "{i*width}";
    this.y      = "{parent.height-height}";
    this.value  = "{d.qtd}";

    this.init = function()
    {
        console.log("AQUI!!");
    }
    
    /**********************************************************************************************
    <g class="bar" style="transform:translate({x}px,0);">
        <rect x="1" y="{y}" height="{height}" width="{width-2}" fill="{color}"/>
        <text x="{width/2}" y="{y-6}" dominant-baseline="middle">{d.qtd}</text> 
        <text x="{width/2}" y="190" dominant-baseline="middle">{range.begin}</text> 
    </g>
    **********************************************************************************************/
}

function color(i)
{
    return i%2==0?"#ff9900":"#009900";
}

function Barra2()
{
    this.range = redot.stack01("{d.qtd}");

    /**********************************************************************************************
    <path d="{donutSlice01(70,90,range)}" fill="{color(i)}"/>
    **********************************************************************************************/
}


var data = [];
for(var i=0; i<50; i++)
{
    data.push({qtd:~~(Math.random()*50)+10});
}

var d1 = redot.filter(data,"{d.qtd<30}");
var d2 = d1.notSelected();

redot.applyTemplate("#main", GraficoDeBarras, d1);
redot.applyTemplate("#main", GraficoDeBarras, d2);
redot.applyTemplate("#main", GraficoDeBarras, data);

setTimeout(function(){data[0].qtd++;redot.changed(data)},5000);

setTimeout(function(){data.sort(function(a,b){return a.qtd-b.qtd});redot.changed(data)},10000);



