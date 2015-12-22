/*
Developed with LIVEditor - http://liveditor.com
*/	
	// function found on developerfusion.com
		function MultiDimensionalArray(iRows,iCols) 
		{
			var i;
			var j;
			var a = new Array(iRows);
			for (i=0; i < iRows; i++) {
				a[i] = new Array(iCols);
				for (j=0; j < iCols; j++) {
					//alert(Math.random);
					//if(Math.random() < 0.3)
						//a[i][j]='hex_tree';
					//else
						a[i][j] = "hex_green";
				}
			}
			return(a);
		} 

		// Setup Hexagon Map
		//flat topped
		var mapsize_x = 37;
		var mapsize_y = 37;
		var hex_width = 41; 
		var hex_height = 61;
		
		var direction=[[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
		var end_q; var end_r;
		var dq,dr;
		var mapArray = MultiDimensionalArray(mapsize_x, mapsize_y);
		//mapArray[3][0] = "hex_tree";
		
		// Draw the map of Hexagons into the div map
		function draw_map() 
		{
			var hex_tiles = "";
	
			for (x=0; x < mapsize_x; x++) {
				var offset= (x&1)*0.5*hex_width;
				hex_y = (x*0.75+0.5)*hex_height;
				for (y=0; y < mapsize_y; y++) {
					hex_x = y* hex_width + offset;
					hex_tiles +='<div id="'+ x + '-' + y +'" style="position:absolute;left:' + hex_x + 'px;top:' + hex_y + 'px;">';
					hex_tiles +='<div id="hex_' + x + '_' + y + '" class="' + mapArray[x][y] + '" onclick="toggle_hex('+x+','+y+');">';
					hex_tiles +='<span id="hex_coords_' + x + '_' + y + '" style="position:absolute;left:15px;top:25px;">'+x+','+y+'</span>';
					hex_tiles +='</div></div>';
				}
			}
			
			document.getElementById('map').innerHTML += hex_tiles;
		}

		function toggle_hex(x, y) 
		{
			if(mapArray[x][y]==='hex_tree') {
				document.getElementById('hex_'+ x +'_' + y).className='hex_green';
				mapArray[x][y]='hex_green';
			} else {
				document.getElementById('hex_'+ x +'_' + y).className='hex_tree';
				mapArray[x][y]='hex_tree';
			}
		}
		
		function hex_accessible(x,y) 
		{
			//alert(x+"|"+y);
			if(mapArray[x] == undefined) return false;
			if(mapArray[x][y] == undefined) return false;
			if(mapArray[x][y] == 'hex_tree') return false;
			
			return true;
		}
		
		function remove_path() 
		{
			var classname;
			for (x=0; x  < mapsize_x; x++) 
			{
				for (y=0; y < mapsize_y; y++) 
				{
					classname=document.getElementById('hex_'+ x +'_' + y).className;
					if( (classname == 'hex_blue') || (classname==='hex_G'))
					{
						document.getElementById('hex_'+ x +'_' + y).className='hex_green';
					}
				}
			}			
		}
		
		// offset 坐标转化为 coordinate坐标
		function offset_to_coordinate(x,y)
		{
			return [y-Math.floor(x/2), x];
		}
		
		//coordinate坐标转化为offset坐标
		function coordinate_to_offset(q,r)
		{
			return [r, q+ Math.floor(r/2)];
		}
		
		//求坐标(q, r)坐标的估价函数h(x).
		function getHexHx(q,r)
		{
			var abs_q = Math.abs(q-end_q);
			var abs_r = Math.abs(r-end_r);
			var abs_z = Math.abs(q+r-end_q-end_r);
			var result = Math.max(Math.max(abs_q, abs_r), abs_z);
			return result;
		}
		
		function InitHex(x, y, parentX, parentY)
		{
			var hex = {};
			hex.x=x; hex.y=y;
			var result=offset_to_coordinate(x, y);
			hex.q=result[0], hex.r=result[1];
			var dqq=end_q-result[0], drr=end_r - result[1];
			hex.bias = Math.abs(dqq * dr-drr*dq);
			hex.parentX=parentX;	hex.parentY=parentY;
			hex.hx =  getHexHx(hex.q, hex.r);
			return hex;
		}
		
		function smaller(value, min_f, min_h, min_bias)
		{
			if(value.fx < min_f)
			{
				return true;
			}
			else if(value.fx === min_f)
			{
				if(value.hx<min_h)
				{
					return true;
				}
				else if((value.hx === min_h) && (value.bias< min_bias))
				{
					return true;
				}
					
			}
				
			return false;	
			
		}
		function remove_smal_fx(openList)
		{
			var min_key;
			var min_f=1000;
			var min_h = 1000;
			var min_bias = 1000;
			
			var value;
			for (var key in openList)
			{
				value = openList[key];
				if(smaller(value, min_f, min_h, min_bias))
				{
					min_f=value.fx;
					min_h=value.hx;
					min_bias = value.bias;
					min_key=key;
				}
			}
			
			var hex = openList[min_key];
			delete openList[min_key];
			return hex;
		}
		
		function neighbors(S, i)
		{
			q=S.q+direction[i][0];
			r=S.r+direction[i][1];
			var result=coordinate_to_offset(q,r);
			var obj = InitHex(result[0], result[1], S.x, S.y);
			return obj;
		}
		
		function printHex(hex)
		{
			alert(hex.x+"|"+hex.y+"|"+hex.fx+"|"+hex.parentX+"|"+hex.parentY);
		}
		// A* Pathfinding with Manhatan Heuristics for Hexagons.
		function path(start_x, start_y, end_x, end_y) {
			// Check cases path is impossible from the start.
			var start= new Date();
			var start_time=start.getTime()/1000;
			start_x=parseInt(start_x);	start_y=parseInt(start_y);
			
			end_x=parseInt(end_x);		end_y=parseInt(end_y);
			var result=offset_to_coordinate(end_x, end_y);
			end_q=result[0],end_r=result[1];
			result=offset_to_coordinate(start_x, start_y);
			dq = end_q - result[0]; dr=end_r-result[1]; 
			
			var error=0;
			if(start_x == end_x && start_y == end_y) error=1;
			if(!hex_accessible(start_x,start_y)) error=1;
			if(!hex_accessible(end_x,end_y)) error=1;
			if(error==1) {
				alert('Path is impossible to create.');
				return false;
			}
			
			var openList = {};
			var openListLength=0;
			var closedList = {};
			var closedListLength=0;
			 
			var hex = InitHex(start_x, start_y, -1, -1);
			
			hex.gx=0;
			hex.fx=hex.hx;
			openList[start_x+"-"+start_y]=hex;
			openListLength+=1;
			find=false;
			
			while(openListLength)
			{
				S = remove_smal_fx(openList);
				openListLength-=1;
				
				closedList[S.x+"-"+S.y]=S;
				closedListLength+=1;
				if((S.x===end_x) && (S.y===end_y))
				{
					find=true;
					break;
				}
				
				for(var i=0; i<6; i++)
				{
					
					var neighbor=neighbors(S, i);
					
					if(!hex_accessible(neighbor.x,neighbor.y))
							continue;
					
					if(closedList.hasOwnProperty(neighbor.x+'-'+neighbor.y))
					 	continue;
						
					var change=false;
					if(!openList.hasOwnProperty(neighbor.x+'-'+neighbor.y))
					{
						change=true;
						openListLength+=1;
					}else if((S.gx + 1)< openList[neighbor.x+'-'+neighbor.y].gx)
					{
						change=true;
					}
					if(change)
					{	
						neighbor.gx=S.gx+1;
						neighbor.fx=neighbor.gx+neighbor.hx;
						openList[neighbor.x+'-'+neighbor.y]=neighbor;
					}
				}
			}
			
			var end = new Date();
			var end_time=end.getTime()/1000;
			alert('用时:'+(end_time-start_time)+'s');
				
			var Q;
			for(key in closedList){
				Q=closedList[key];
				document.getElementById('hex_' + Q.x + '_' + Q.y).className = 'hex_G';
			}
			
			for(key in openList){
				Q=openList[key];
				document.getElementById('hex_' + Q.x + '_' + Q.y).className = 'hex_G';
			}
			if(find)
			{
			  var Q = closedList[end_x+"-"+end_y];
			  document.getElementById('hex_' + Q.x + '_' + Q.y).className = 'hex_blue';
			  var parentX=Q.parentX;
			  var parentY = Q.parentY;
			  while(parentX!==-1)
			  {
				Q = closedList[parentX+"-"+parentY];
				document.getElementById('hex_' + Q.x + '_' + Q.y).className = 'hex_blue';
				parentX=Q.parentX;
				parentY=Q.parentY;
			  }
			  
			  
			}
			else
			{
				alert("There is no way!");
			}
		}