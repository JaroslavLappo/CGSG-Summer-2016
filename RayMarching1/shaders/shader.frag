precision mediump float;

#define Pi 3.1415926535897932384626433832795028841971

float sdPlane( vec3 p )
{
	return p.y;
}

float sdSphere( vec3 p, float s )
{
    return length(p)-s;
}

float sdBox( vec3 p, vec3 b )
{
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sdEllipsoid( in vec3 p, in vec3 r )
{
    return (length( p/r ) - 1.0) * min(min(r.x,r.y),r.z);
}

float udRoundBox( vec3 p, vec3 b, float r )
{
  return length(max(abs(p)-b,0.0))-r;
}

float sdTorus( vec3 p, vec2 t )
{
  return length( vec2(length(p.xz)-t.x,p.y) )-t.y;
}

float sdHexPrism( vec3 p, vec2 h )
{
    vec3 q = abs(p);
#if 0
    return max(q.z-h.y,max((q.x*0.866025+q.y*0.5),q.y)-h.x);
#else
    float d1 = q.z-h.y;
    float d2 = max((q.x*0.866025+q.y*0.5),q.y)-h.x;
    return length(max(vec2(d1,d2),0.0)) + min(max(d1,d2), 0.);
#endif
}

float sdCapsule( vec3 p, vec3 a, vec3 b, float r )
{
	vec3 pa = p-a, ba = b-a;
	float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
	return length( pa - ba*h ) - r;
}

float sdTriPrism( vec3 p, vec2 h )
{
    vec3 q = abs(p);
#if 0
    return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
#else
    float d1 = q.z-h.y;
    float d2 = max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5;
    return length(max(vec2(d1,d2),0.0)) + min(max(d1,d2), 0.);
#endif
}

float sdCylinder( vec3 p, vec2 h )
{
  vec2 d = abs(vec2(length(p.xz),p.y)) - h;
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdCone( in vec3 p, in vec3 c )
{
    vec2 q = vec2( length(p.xz), p.y );
    float d1 = -q.y-c.z;
    float d2 = max( dot(q,c.xy), q.y);
    return length(max(vec2(d1,d2),0.0)) + min(max(d1,d2), 0.);
}

float sdConeSection( in vec3 p, in float h, in float r1, in float r2 )
{
    float d1 = -p.y - h;
    float q = p.y - h;
    float si = 0.5*(r1-r2)/h;
    float d2 = max( sqrt( dot(p.xz,p.xz)*(1.0-si*si)) + q*si - r2, q );
    return length(max(vec2(d1,d2),0.0)) + min(max(d1,d2), 0.);
}


float length2( vec2 p )
{
	return sqrt( p.x*p.x + p.y*p.y );
}

float length6( vec2 p )
{
	p = p*p*p; p = p*p;
	return pow( p.x + p.y, 1.0/6.0 );
}

float length8( vec2 p )
{
	p = p*p; p = p*p; p = p*p;
	return pow( p.x + p.y, 1.0/8.0 );
}

float sdTorus82( vec3 p, vec2 t )
{
  vec2 q = vec2(length2(p.xz)-t.x,p.y);
  return length8(q)-t.y;
}

float sdTorus88( vec3 p, vec2 t )
{
  vec2 q = vec2(length8(p.xz)-t.x,p.y);
  return length8(q)-t.y;
}

float sdCylinder6( vec3 p, vec2 h )
{
  return max( length6(p.xz)-h.x, abs(p.y)-h.y );
}

//----------------------------------------------------------------------

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

vec3 opTwist( vec3 p )
{
    float  c = cos(10.0*p.y+10.0);
    float  s = sin(10.0*p.y+10.0);
    mat2   m = mat2(c,-s,s,c);
    return vec3(m*p.xz,p.y);
}

//----------------------------------------------------------------------

vec2 map( in vec3 pos )
{
    vec2 res = /*opU( vec2( sdPlane(     pos), 1.0 ),*/
	                vec2( sdSphere(    pos-vec3( 0.0,0.25, 0.0), 0.25 ), 46.9 ) /*)*/;
    res = opU( res, vec2( sdBox(       pos-vec3( 1.0,0.25, 0.0), vec3(0.25) ), 3.0 ) );
    res = opU( res, vec2( udRoundBox(  pos-vec3( 1.0,0.25, 1.0), vec3(0.15), 0.1 ), 41.0 ) );
	res = opU( res, vec2( sdTorus(     pos-vec3( 0.0,0.25, 1.0), vec2(0.20,0.05) ), 25.0 ) );
    res = opU( res, vec2( sdCapsule(   pos,vec3(-1.3,0.10,-0.1), vec3(-0.8,0.50,0.2), 0.1  ), 31.9 ) );
	res = opU( res, vec2( sdTriPrism(  pos-vec3(-1.0,0.25,-1.0), vec2(0.25,0.05) ),43.5 ) );
	res = opU( res, vec2( sdCylinder(  pos-vec3( 1.0,0.30,-1.0), vec2(0.1,0.2) ), 8.0 ) );
	res = opU( res, vec2( sdCone(      pos-vec3( 0.0,0.50,-1.0), vec3(0.8,0.6,0.3) ), 55.0 ) );
	res = opU( res, vec2( sdTorus82(   pos-vec3( 0.0,0.25, 2.0), vec2(0.20,0.05) ),50.0 ) );
	res = opU( res, vec2( sdTorus88(   pos-vec3(-1.0,0.25, 2.0), vec2(0.20,0.05) ),43.0 ) );
	res = opU( res, vec2( sdCylinder6( pos-vec3( 1.0,0.30, 2.0), vec2(0.1,0.2) ), 12.0 ) );
	res = opU( res, vec2( sdHexPrism(  pos-vec3(-1.0,0.20, 1.0), vec2(0.25,0.05) ),17.0 ) );

    res = opU( res, vec2( opS(
		             udRoundBox(  pos-vec3(-2.0,0.2, 1.0), vec3(0.15),0.05),
	                 sdSphere(    pos-vec3(-2.0,0.2, 1.0), 0.25)), 13.0 ) );
    res = opU( res, vec2( opS(
		             sdTorus82(  pos-vec3(-2.0,0.2, 0.0), vec2(0.20,0.1)),
	                 sdCylinder(  opRep( vec3(atan(pos.x+2.0,pos.z)/6.2831,
											  pos.y,
											  0.02+0.5*length(pos-vec3(-2.0,0.2, 0.0))),
									     vec3(0.05,1.0,0.05)), vec2(0.02,0.6))), 51.0 ) );
	res = opU( res, vec2( 0.7*sdSphere(    pos-vec3(-2.0,0.25,-1.0), 0.2 ) +
					                   0.03*sin(50.0*pos.x)*sin(50.0*pos.y)*sin(50.0*pos.z),
                                       65.0 ) );
	res = opU( res, vec2( 0.5*sdTorus( opTwist(pos-vec3(-2.0,0.25, 2.0)),vec2(0.20,0.05)), 46.7 ) );

    res = opU( res, vec2(sdConeSection( pos-vec3( 0.0,0.35,-2.0), 0.15, 0.2, 0.1 ), 13.67 ) );

    res = opU( res, vec2(sdEllipsoid( pos-vec3( 1.0,0.35,-2.0), vec3(0.15, 0.2, 0.05) ), 43.17 ) );

    return res;
}


float SDF_ball( vec3 Point )
{
  return length(Point) - 1.0;
}

float SDF_torus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

vec3 RotateX( vec3 Point, float Angle )
{
  vec3 NewPoint;
  float cosine = cos(Angle), sine = sin(Angle);

  NewPoint = vec3(Point.x, cosine * Point.y - sine * Point.z, sine * Point.y + cosine * Point.z);

  return NewPoint;
}

vec3 Twist( vec3 p )
{
    float c = cos(1.2*p.y);
    float s = sin(1.2*p.y);
    mat2  m = mat2(c,-s,s,c);
    vec2 xz = m * p.xz;
    vec3  q = vec3(xz.x, p.y, xz.y);
    return q;
}

float SDF( vec3 Point )
{
  //return SDF_torus(RotateX(Twist(Point), 90.0 / 180.0 * Pi), vec2(6, 2));
  return map(Point).x;
}

uniform vec3 CamPos;
uniform vec3 CamView;
uniform float ProjDist;

uniform int Width;
uniform int Height;

vec3 R( vec3 V, float T )
{
  return CamPos + V * T;
}

vec4 GetIntersection( vec3 V )
{
  const float tMin = 0.0;
  const float tMax = 1000.0;
  const float dMin = 0.00002;

  const int iterMax = 1000;

  float T = tMin;

  for (int i = 0; i < iterMax; i++)
  {
    float d;

    d = SDF(R(V, T));
    T += d;

    if (d < dMin || T > tMax)
      break;
  }

  if (SDF(R(V, T)) < dMin)
    return vec4(R(V, T), 1.0);
  else
    return vec4(0.0, 0.0, 0.0, 0.0);
}

void main(void)
{
  vec3 CamViewProjDist;
  float XOff, YOff;
  vec3 V;
  float XScale = float(Width);
  float YScale = float(Height);

  if (Width > Height)
    YScale *= float(Width) / float(Height);
  else
    XScale *= float(Height) / float(Width);

  vec3 Up = vec3(0, 1, 0);
  vec3 Right = normalize(cross(CamView, Up));

  XOff = gl_FragCoord.x / XScale * 2.0 - 1.0;
  YOff = gl_FragCoord.y / YScale * 2.0 - 1.0;

  CamViewProjDist = normalize(CamView) * ProjDist;

  V = normalize(CamViewProjDist + XOff * Right + YOff * Up);

  vec4 Inter = GetIntersection(V);

  if (Inter.w > 0.5)
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  else
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
