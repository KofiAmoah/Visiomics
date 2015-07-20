$(function(){
    $('a').each(function() {
        if ($(this).prop('href') == window.location.href) {
        $(this).addClass('current');
        }
    });
});

window.onload = function() {
	var selectFuntion = document.getElementById('selectFuntion');
	var runButton = document.getElementById('runButton');
	var fileInput = document.getElementById('fileInput');
	var fileInput2 = document.getElementById('fileInput2');
	if (window.location.pathname == "/linkFinder") {//To determine the default fx to call
		var fx = createBoxPlot;
	} else{
		var fx = createVenn;
	}
	$('#selectFunction').on('change', function() {
		if (selectFunction.options[selectFunction.selectedIndex].value == "continuous") {
			fx = createScatter;
		} else if (selectFunction.options[selectFunction.selectedIndex].value == "binary") {
			fx = createBoxPlot;
		} else if (selectFunction.options[selectFunction.selectedIndex].value == "survival") {
			fx = getInputDataAndDrawKM;
		} else if (selectFunction.options[selectFunction.selectedIndex].value == "scatterplot") {
			fx = scatter2;
		} else if (selectFunction.options[selectFunction.selectedIndex].value == "venn") {
			fx = createVenn;
		} else if (selectFunction.options[selectFunction.selectedIndex].value == "heatmap") {
			fx = console.log;
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
};
