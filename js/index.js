jQuery( document ).ready(function( $ ) {
  $( function() {
    $( "#tabs" ).tabs();
    $( "#slider-vertical" ).slider({
      orientation: "vertical",
      range: "false",
      animate: "fast",
      min: 1949,
      max: 2019,
      value: 1984,
      slide: function( event, ui ) {
        $( "#year" ).val( ui.value );
      }
    });
    $( "#year" ).val( $( "#slider-vertical" ).slider( "value" ) );
  } );
});
