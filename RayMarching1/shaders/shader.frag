precision mediump float;

float SDF_main( vec3 Point )
{
  return length(Point) - 1.0;
}

uniform vec3 CamPos;
uniform vec3 CamView;
uniform float CamAngle;

uniform int Width;
uniform int Height;

void main(void)
{
  gl_FragColor = gl_FragCoord / vec4(Width, Height, 1, 1);//vec4(0.0, 1.0, 1.0, 1.0);
}
