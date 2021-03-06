
// dragdrop object(dictionary) is a collection of keys and values (functions) to drag and drop the images 
// inside thumbnailImage div. A function is assigned to init key which handels the events "drop", "dragenter",
// "dragover", "dragleave". The main reason to use dictionary here is to organize the event handler functions.
// The function assigned to drop key, will take the data(images) through e.dataTransfer.files. Then iterate 
// through the files and upload the files inside the thumbnailImage div by calling runUpload function. 


// defining global variables
var images_per_row = 3;

// Materials are basically shaders(like edgeDetection shader, greyscale shader) and I need to append all the materials 
// to allMaterials array in order to recognize the new texture every time I want to edit a new image
var allMaterials = [];

// total_image_num is the total number of images in drage and drop box
var total_image_num = 0;

// create a variable called mesh which basically consists of two triangles which created the 3D rectangle where the image is projected on
var mesh;

// global boolean
var thumbnailImageDragged = false;

// not sure what does the following function does, it sounds like the original coder had writtern its own dollar sign
(function(){
// http://stackoverflow.com/questions/4083351/what-does-jquery-fn-mean
	var select = function( elem ){
		if (!(this instanceof select)){
      return new select(elem);
		}
		this.el = document.getElementById( elem );
	};
	window.select = select;
	select.prototype = {    //onChange is a property of select.prototype object
		onChange : function( callback ){
			this.el.addEventListener('change', callback );
			return this;
		}
	};
})();

// function to capture a file(image) and upload it to the thumbnailImage div
export	function runUpload(file, myDiv, current_image_id){
	if( file.type === 'image/png' ||
		file.type === 'image/jpg' ||
		file.type === 'image/jpeg'||
		file.type === 'image/gif' ||
		file.type === 'image/bmp' ){
	  var reader = new FileReader();
	  reader.readAsDataURL(file);

	  // customizing the onload method and how to do onload
	  // reader calls the onload function(which is basically a callback function)
	  // handler is a good definition for this type of function as well
	  reader.onload = function(file_being_loaded){
	  	var myImageTag = $('<img>');
	  	//attach a dragstart event to <img> tag
	  	myImageTag.on('dragstart', dragToEditingDiv);
	  	//attach a dragend event to <img> tag
	  	myImageTag.on('dragend', endDragToEditingDiv);
	  	//using template string to set different ids for <img> tag
	  	myImageTag.attr("id", `draggableImage${current_image_id}`); 
	  	//jQuery to set the src attribute for <img> tag
		myImageTag.attr("src",file_being_loaded.target.result); 
		myImageTag.attr("draggable",true);
		myImageTag.attr("class", "imageEdit");
		myDiv.append(myImageTag);

	  } // END reader.onload()
	} // END test if file.type === imagerun
}

// Setter functions
// this function basically takes a material(shader) as an input and push it into allMaterials array 
export function registerMaterialForDragDropUpdates(m){
	allMaterials.push(m);
}

export function setMeshForDragDrop(m){
	mesh = m;
}

function adjustMeshVerticesUsingNewWidthandHeight(texture_width, texture_height){

	var new_width = 2;
	var width_height_ratio = (texture_height/texture_width);
	var new_height = width_height_ratio * new_width;
	var vertices = mesh.geometry.attributes.position.array;
	var newVertices = [-new_width/2, -new_height/2, new_width/2, new_width/2, -new_height/2, new_width/2, new_width/2, new_height/2, new_width/2, 
	new_width/2, new_height/2, new_width/2, -new_width/2, new_height/2, new_width/2, -new_width/2, -new_height/2, new_width/2];
	// in this for loop we are basically replalcing the new vertices with the old vertices in order to keep the ratio of the image
	for (let i=0; i<newVertices.length; i++){
		vertices[i] = newVertices[i];
	}
	mesh.geometry.attributes.position.needsUpdate = true;
	
}

function fileToImage(file){
	// convert linear index to 2D index
    var xIndex = total_image_num % images_per_row;
    var yIndex = Math.floor(total_image_num / images_per_row);

    var leftOffset = xIndex * 105;
    var topOffset = yIndex * 105;

    var myDiv = $('<div></div>');
	runUpload(file, myDiv, total_image_num); 
	
	myDiv.css({
        left: leftOffset,
        top: topOffset,
        position: "absolute"
    });
	$('#thumbnailImage').append(myDiv);
	total_image_num += 1;
}

// adding event handler to the body, so the border of the corresponding div gets highlited
// as soon as drag an image to the body
document.addEventListener('dragover', function(e){
	$('#thumbnailImage').css({ 'border': 'solid 2px #86C232' });
	if (thumbnailImageDragged){
		$('#thumbnailImage').css({ 'border': 'solid 2px #616161' });
		$('#mainEditor').css({ 'border': 'solid 2px #86C232' });	
	}

});


export var dragdropUpload = {
    elem: null,  
	init: function(elementValue){
		elementValue.addEventListener('drop', dragdropUpload.drop);
		elementValue.addEventListener('dragover', dragdropUpload.dragover);
        elementValue.addEventListener('dragleave', dragdropUpload.leave);
        dragdropUpload.elem = elementValue;
	},

	drop: function(e){
		e.preventDefault();
		$("#thumbnailDivDescription").remove();
        // set element border back to grey
        if (dragdropUpload.elem !== null) {
            $(dragdropUpload.elem).css({ 'border': 'solid 2px #616161' }); //it is jQuery(css and $)
        }

		// To upload more than one image we can loop over the file
		// and runUpload the files one by one
		var listOfFiles = e.dataTransfer.files;
		if (total_image_num > 5){
            console.error("you cannot upload more than six pictures");
            return;
        }
		for (var i=0; i<listOfFiles.length; i++){
		// converting linear index to 2D index for thumbnail images
			fileToImage(listOfFiles[i]);
		}

	},

	dragover: function(e){
		e.preventDefault();
	},

    leave: function(e) {
        // set element border back to grey
        if (dragdropUpload.elem !== null) {
            $(dragdropUpload.elem).css({ 'border': 'solid 2px #616161' });
        }
    }
};

function dragToEditingDiv(ev){
	ev.originalEvent.dataTransfer.setData("text", ev.originalEvent.target.id);
	thumbnailImageDragged = true;
}

function endDragToEditingDiv(ev){
	thumbnailImageDragged = false;		
}

// dropToEditingDiv function is basically get the image data as a "text" and also the url of the image and load the imgSrc in TextureLoader()
// We can then get the width and height of the image(texture). then for the loop is basically looping over allMaterials array and assign 
// the uniform values to the materials which are basically the new textures(images).

function dropToEditingDiv(ev){ //drop function works when I am releasing the mouse
	var thumbnailImageID = ev.originalEvent.dataTransfer.getData("text"); // image is stored as a string
	var imgSrc = document.getElementById(thumbnailImageID).getAttribute("src"); // so basically we get a thumbnail image through its id and get the url of the image as a result
	$('#mainEditorDescription').remove();
	$('#mainEditor').css({ 'border': 'solid 2px #616161' });
	
	// create texture_loader
	var texture_loader = new THREE.TextureLoader();
	var texture = texture_loader.load(imgSrc);

	var texture_width = texture.image.width;
	var texture_height = texture.image.height;

	for (let i=0; i<allMaterials.length; i++){
		allMaterials[i].uniforms.texture.value = texture;
	}

	adjustMeshVerticesUsingNewWidthandHeight(texture_width, texture_height);
	
}

// drag and drop thumbnail images in main Editor div
export function initializeDragDrop(){
	$("#mainEditor").on("drop", dropToEditingDiv);
	$("#mainEditor").on("dragover", allowDropToEditingDiv);
}

function allowDropToEditingDiv(ev){
	ev.originalEvent.preventDefault();
}


export function initializeUploadImage(){
	if (window.FileReader){
		// initializing the 'droppingDiv' div to HTML5 drag and drop calls
		dragdropUpload.init(select('thumbnailImage').el);
		// bind the input [type="file"] to the function runUpload()
		select('fileUpload').onChange(function(){
			if (total_image_num > 5){
				console.error("you cannot upload more than six pictures");
				return;
			};
			fileToImage(this.files[0]);
		});
	}else{
		// report error message if FileReader is unavailable
		var p = document.createElement('p');
		var msg = document.createElement('Sorry, your browser does not support FileReader.');
		p.className = 'error';
		p.appendChild(msg);
		//select(droppingDiv) returns a dictionary which has a key 
		//element called "el" which happens to be the image
		select(thumbnailImage).el.innerHTML = ''; 
		select(thumbnailImage).el.appendChild( p );
	}
};
