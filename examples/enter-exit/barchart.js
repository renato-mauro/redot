function GraficoDeBarras(d)
{
    d.width    = 1024;
    d.height   = 200;
    
    /**********************************************************************************************
    <div>
        <svg width="{d.width+50}" height="{d.height+50}" style="border: 1px black solid;">
            <g transform="translate(25 25)" style="text-anchor: middle;">
                <include template="Barra" data="{d}" />
            </g>
        </svg>
    </div>
    **********************************************************************************************/
}

function Barra(d,i)
{        
    d.color = "skyblue";
    d.width = ~~(1024/50);
    d.height = 2*d.qtd;
    d.x = -100;
    d.y = 200-d.height;
    
    d.select = function(flag)
    {
        d.color = flag ? "orange" : "skyblue";
    }
    
    d.foo = function()
    {
        // console.log("transição terminou " + i);
    }
        
    /**********************************************************************************************
    <g class="bar" style="transform:translate({i*d.width}px,0);" ontransitionend="{d.foo()}">
        <rect onmouseover="{d.select(true)}" onmouseout="{d.select(false)}" x="1" y="{200-2*d.qtd}" height="{2*d.qtd}" width="{d.width-2}" fill="{d.color}"/>
        <text x="{d.width/2}" y="{200-2*d.qtd-6}" alignment-baseline="middle">{d.qtd}</text> 
        <text x="{d.width/2}" y="{200-2*d.qtd+2*d.qtd}" alignment-baseline="middle">{i}</text> 
    </g>
    **********************************************************************************************/
}

var data = [];
for(var i=0; i<48; i++)
{
    data.push({qtd:~~(Math.random()*91)+10});
}
redot.applyTemplate("#main", GraficoDeBarras, data);

var j = 48;
var interval = setInterval(function(){
    data.push({qtd:~~(Math.random()*91)+10});
    data.push({qtd:~~(Math.random()*91)+10});
    j++;
    if(j > 50)
    {
        data.shift();
        data.shift();
    }
    redot.changed(data);
},600);

