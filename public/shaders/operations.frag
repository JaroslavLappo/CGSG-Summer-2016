float opS( float d1, float d2 )
{
    return max(-d2,d1);
}

vec2 opU( vec2 d1, vec2 d2 )
{
	return (d1.x<d2.x) ? d1 : d2;
}

vec3 opRep( vec3 p, vec3 c )
{
    return mod(p,c)-0.5*c;
}

vec3 RotateX( vec3 Point, float Angle )
{
  vec3 NewPoint;
  float cosine = cos(Angle), sine = sin(Angle);

  NewPoint = vec3(Point.x, cosine * Point.y - sine * Point.z, sine * Point.y + cosine * Point.z);

  return NewPoint;
}