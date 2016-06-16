precision mediump float;
void main(void)
{
  gl_FragColor = gl_FragCoord / vec4(600, 600, 1, 1);//vec4(0.0, 1.0, 1.0, 1.0);
}
