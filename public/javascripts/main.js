$(function(){
    $('a').each(function() {
        if ($(this).prop('href') == window.location.href) {
        $(this).addClass('current');
        }
    });
});

if (window.location.pathname == "/linkCompare" || window.location.pathname == "/linkFinder") {
	window.onload = function() {
		var dataImg = document.getElementById('dataImg');
		var selectFuntion = document.getElementById('selectFuntion');
		var runButton = document.getElementById('runButton');
		var fileInput = document.getElementById('fileInput');
		var fileInput2 = document.getElementById('fileInput2');
		if (window.location.pathname == "/linkFinder") {//To determine the default fx to call
			var fx = createBoxPlot;
			dataImg.src = "/images/binary_data.png";
		} else if (window.location.pathname == "/linkCompare"){
			dataImg.src = "/images/venn_data.png";
			var fx = createVenn;
		}
		$('#selectFunction').on('change', function() {
			if (selectFunction.options[selectFunction.selectedIndex].value == "continuous") {
				dataImg.src = "/images/continuous_data.png";
				fx = createScatter;
			} else if (selectFunction.options[selectFunction.selectedIndex].value == "binary") {
				dataImg.src = "/images/binary_data.png";
				fx = createBoxPlot;
			} else if (selectFunction.options[selectFunction.selectedIndex].value == "survival") {
				dataImg.src = "/images/survival_data.png";
				fx = alert("Function not added yet");
				//fx = getInputDataAndDrawKM;
			} else if (selectFunction.options[selectFunction.selectedIndex].value == "scatterplot") {
				dataImg.src = "/images/scatterplot_data.png";
				fx = scatter2;
			} else if (selectFunction.options[selectFunction.selectedIndex].value == "venn") {
				dataImg.src = "/images/venn_data.png";
				fx = createVenn;
			} else if (selectFunction.options[selectFunction.selectedIndex].value == "heatmap") {
				dataImg.src = "/images/heatmap_data.png";
				fx = alert("Function not added yet");
			}
		});
		switch(selectFunction.options[selectFunction.selectedIndex].value) {
			case 'venn':
				runButton.addEventListener('click', function(e) {
					e.preventDefault();
					var file1 = fileInput.files[0];
					var file2 = fileInput2.files[0];
					var url1 = window.URL.createObjectURL(file1);
					var url2 =window.URL.createObjectURL(file2);
					fx(url1, url2);
				});
				break;

			default:
				runButton.addEventListener('click', function(e) {
					e.preventDefault();
					var file = fileInput.files[0];
					var url = window.URL.createObjectURL(file);
					fx(url);
				});
		};

		//Remove svg from modal when modal is hidden...so that only 1 graph shows at a time
		$('#myModal').on('hidden.bs.modal', function () {
			$("#viz").empty();
		});
	};
};
