precision mediump float;

uniform vec3 LightPos;

#define Pi 3.1415926535897932384626433832795028841971

float sdPlane( vec3 p, float h )
{
	return p.y - h;
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
  vec2 res;
///    vec2 res = /*opU( vec2( sdPlane(     pos), 1.0 ),*/
///	                vec2( sdSphere(    pos-vec3( 0.0,0.25, 0.0), 0.25 ), 46.9 ) /*)*/;
/*    vec2 res = opU( vec2( sdPlane(     pos), 1.0 ),
	                vec2( sdSphere(    pos-vec3( 0.0,0.25, 0.0), 0.25 ), 46.9 ) );

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
  */
    res = vec2(opS(
		             sdTorus82(  pos-vec3(0.0,0.2, 0.0), vec2(0.20,0.1)),
	                 sdCylinder(  opRep( vec3(atan(pos.x+0.0,pos.z)/6.2831,
											  pos.y,
											  0.02+0.5*length(pos-vec3(0.0,0.2, 0.0))),
									     vec3(0.05,1.0,0.05)), vec2(0.02,0.6))), 51.0 );

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
    vec3  q = vec3(xz, p.y);
    return q;
}

vec2 SDF( vec3 Point )
{
  //return SDF_torus(RotateX(Twist(Point), 90.0 / 180.0 * Pi), vec2(6, 2));
  //return map(Point).x;
  vec2 Prism = vec2(sdCylinder(RotateX(Point, 90.0 / 180.0 * Pi), vec2(0.1, 0.2)), 1.0);
  vec2 Plane = vec2(sdPlane(Point, -0.1), 2.0);
  vec2 LightSource = vec2(sdSphere(Point - LightPos, 0.03), -1.0);

  return opU(opU(Prism, Plane), LightSource);
}

uniform vec3 CamPos;
uniform vec3 CamView;
uniform float ProjDist;

uniform int Width;
uniform int Height;

vec3 Ray( vec3 Origin, vec3 Direction, float T )
{
  return Origin + Direction * T;
}

const float tMin = 0.001;
const float tMax = 1000.0;
const float dMin = 0.000001;
const int iterMax = 500;

vec2 Intersect( vec3 V )
{
  float T = tMin;

  for (int i = 0; i < iterMax; i++)
  {
    float d;

    d = SDF(Ray(CamPos, V, T)).x;
    T += d;

    if (d < dMin || T > tMax)
      break;
  }

  if (SDF(Ray(CamPos, V, T)).x < dMin)
    return vec2(T, SDF(Ray(CamPos, V, T)).y);
  else
    return vec2(0.0, 0.0);
}

float IntersectShadow( vec3 Point, vec3 Light )
{
  float T = 2.0 * tMin;
  vec3 Direction = normalize(Light - Point);

  for (int i = 0; i < iterMax; i++)
  {
    float d;
    vec2 sdf;

    sdf = SDF(Ray(Point, Direction, T));
    d = sdf.x;
    T += d;

    if (d < dMin || T > tMax)
      break;
  }

  if (SDF(Ray(Point, Direction, T)).y < 0.0)
    return 1.0;
  else
    return 0.0;
}

vec3 Normal( vec3 Point )
{
  float E = 0.00001;

  return normalize(vec3(SDF(Point + vec3(E, 0, 0)).x - SDF(Point - vec3(E, 0, 0)).x,
                        SDF(Point + vec3(0, 0, E)).x - SDF(Point - vec3(0, E, 0)).x,
                        SDF(Point + vec3(0, 0, E)).x - SDF(Point - vec3(0, 0, E)).x));
}

vec3 Shade( vec3 Point, vec3 View, vec3 Normal, float Material )
{
  vec3 LightColor = vec3(1.0, 1.0, 1.0);
  vec3 Ka = vec3(0.0);
  vec3 Ke = vec3(0.0);
  vec3 Kd = vec3(0.3, 1.0, 0.8);
  vec3 Ks = vec3(0.2);
  float Kp = 0.6;
  vec3 Color = vec3(0.0, 0.0, 0.0);
  float Shadow;

  Shadow = IntersectShadow(Point, LightPos);

  if (Shadow < 0.5)
    return Ka + Ke;

  if (abs(Material - 2.0) < 0.1)
    Kd = vec3(0.7, 0.0, 0.0);

  if (abs(Material - -1.0) < 0.1)
    return LightColor;

  Color += Ka;

  Color += Kd * dot(Normal, normalize(LightPos - Point));

  vec3 Reflect;

  Reflect = normalize(2.0 * Normal + normalize(Point - LightPos));

  float ReflectRes = -dot(View, Reflect);

  if (ReflectRes > 0.0)
    Color += Ks * pow(ReflectRes, Kp);

  Color *= LightColor;

  Color += Ke;

  float dist = length(Point - LightPos);

  if (dist > 2.0)
    return vec3(0.0);
  return (1.0 - dist / 2.0) * Color;
}

void main( void )
{
  vec3 CamViewProjDist;
  float XOff, YOff;
  vec3 V;
  float XScale = 1.0 * float(Width);
  float YScale = 1.0 * float(Height);

  if (Width > Height)
    YScale *= float(Width) / float(Height);
  else
    XScale *= float(Height) / float(Width);

  vec3 Up = vec3(0, 1, 0);
  vec3 Right = normalize(cross(CamView, Up));
  Up = normalize(cross(Right, CamView));

  XOff = gl_FragCoord.x / XScale * 2.0 - 1.0;
  YOff = gl_FragCoord.y / YScale * 2.0 - 1.0;

  CamViewProjDist = normalize(CamView) * ProjDist;

  V = normalize(CamViewProjDist + XOff * Right + YOff * Up);

  vec2 Inter = Intersect(V);

  if (abs(Inter.y) > 0.5)
  {
    vec3 point = Ray(CamPos, V, Inter.x);
    vec3 normal = Normal(point);
///*Depth*/    gl_FragColor = vec4((1.0 - Inter.x / 2.0) * vec3(1.0, 1.0, 1.0), 1.0);
///*Normal*/    gl_FragColor = vec4(normal, 1.0);
/*Lighting*/    gl_FragColor = vec4(Shade(point, V, normal, Inter.y), 1.0);
///*Material*/    gl_FragColor = vec4(vec3((Inter.y + 1.0) / 3.0), 1.0);
  }
  else
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
