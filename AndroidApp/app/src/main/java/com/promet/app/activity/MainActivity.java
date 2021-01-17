package com.promet.app.activity;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationAvailability;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnSuccessListener;
import com.promet.R;
import com.promet.app.api.PostAPI;

import org.opencv.android.OpenCVLoader;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Vector;

public class MainActivity extends AppCompatActivity implements SensorEventListener {
    //GPS
    public static final int INTERVAL_DEFAULT_TIMER = 3;
    public static final int INTERVAL_FAST_TIMER = 1;
    public static final int PRIORITY_LOCATION_ACCURACY = LocationRequest.PRIORITY_BALANCED_POWER_ACCURACY;
    private static final int PERMISSIONS_FINE_LOCATION = 23;
    private static final int PERMISSIONS_CAMERA_REQUEST_CODE = 100;
    private static final int PERMISSIONS_MULTIPLY_REQUEST_CODE = 123;
    public static final float GRAVITY_EARTH = SensorManager.GRAVITY_EARTH;
    public static final int SENSOR_DELAY_NORMAL = SensorManager.SENSOR_DELAY_NORMAL;
    public static final int DEFAULT_AMPLITUDE = VibrationEffect.DEFAULT_AMPLITUDE;
    public static final double Vibrator_Time_Seconds = 0.5;
    private static final long START_TIME_IN_SECONDS = 60;

    private TextView tv_latiency;
    private TextView tv_longitude;
    private TextView tv_altitude;
    private TextView tv_speed;
    private TextView tv_adress;

    FusedLocationProviderClient fusedLocationProviderClient;
    LocationRequest locationRequest;
    Boolean isUpdated = false;
    LocationCallback locationCallBack;

    public static Geocoder geocoder;

    //Algorithm
    private int counter = 0;
    private long currAcc;
    private long lastAcc;
    private long shake;
    private TextView tv_condition;

    //Vibrator
    Vibrator vibrator;

    //Timer
    private CountDownTimer mCountDownTimer;
    private boolean mTimerRunning;
    private long mTimeLeftInMillis = START_TIME_IN_SECONDS * 1000;
    private Vector numHoles;

    //OPENCV
    static {
        if (OpenCVLoader.initDebug()) {
            Log.d("MainActivity", "OpenCV configured successfully");
        } else {
            Log.d("MainActivity", "OpenCV configuration failed");
        }
    }

    SharedPreferences sharedPreferences;
    public static String uuid;

    public static Location location;
    private LocationManager locationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        //GPS
        tv_latiency = (TextView) findViewById(R.id.tv_lat);
        tv_longitude = (TextView) findViewById(R.id.tv_lon);
        tv_altitude = (TextView) findViewById(R.id.tv_altitude);
        tv_speed = (TextView) findViewById(R.id.tv_speed);
        tv_adress = (TextView) findViewById(R.id.tv_address);

        locationRequest = new LocationRequest();
        locationRequest.setInterval(1000 * INTERVAL_DEFAULT_TIMER);
        locationRequest.setFastestInterval(1000 * INTERVAL_FAST_TIMER);
        locationRequest.setPriority(PRIORITY_LOCATION_ACCURACY);

        locationCallBack = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                super.onLocationResult(locationResult);
                updateUIValue(location = locationResult.getLastLocation());
                try {
                    postLocationData(location);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            @Override
            public void onLocationAvailability(LocationAvailability locationAvailability) {
                super.onLocationAvailability(locationAvailability);
            }
        };
        updateGPS();
        startLocationChanged();

        //Algorithm
        currAcc = (long) SensorManager.GRAVITY_EARTH;
        lastAcc = (long) SensorManager.GRAVITY_EARTH;
        shake = (long) 0.00;
        numHoles = new Vector();
        tv_condition=findViewById(R.id.tv_condition);
        resetTimer();

        //Vibrator
        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);

        //CAMERA
        Button roadCamButton = findViewById(R.id.road_camera_button);

        roadCamButton.setOnClickListener((v) -> {
            Intent intent = new Intent(this, RoadCamera.class);
            startActivity(intent);
        });

        sharedPreferences = PreferenceManager.getDefaultSharedPreferences(getApplicationContext());

        @SuppressLint("CommitPrefEdits") SharedPreferences.Editor editor = sharedPreferences.edit();

        if(!sharedPreferences.contains("uuid")){
            uuid = UUID.randomUUID().toString().replace("-", "");
            editor.putString("uuid", uuid);

            editor.apply();
        } else {
            uuid = sharedPreferences.getString("uuid", "");
        }
    }

    //GPS METHODS
    private void stopLocationChanged() {
        tv_latiency.setText("0");
        tv_longitude.setText("0");
        tv_speed.setText("0");
        tv_adress.setText("...");
        tv_altitude.setText("0");

        fusedLocationProviderClient.removeLocationUpdates(locationCallBack);
    }

    private void startLocationChanged() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                || ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            return;
        }
        fusedLocationProviderClient.requestLocationUpdates(locationRequest, locationCallBack, null);
        updateGPS();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        switch (requestCode) {
            case PERMISSIONS_FINE_LOCATION:
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    updateGPS();
                }
                else {
                    Toast.makeText(this, "Lokacija ni dovoljena", Toast.LENGTH_SHORT).show();
                    finish();
                }
            case PERMISSIONS_CAMERA_REQUEST_CODE:
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    Toast.makeText(this, "Camera je dovoljena", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(this, "Camera ni dovoljena", Toast.LENGTH_SHORT).show();
                    finish();
                }
        }
    }

    private void updateGPS() {
        fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(MainActivity.this);
        try {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED &&
                    ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                fusedLocationProviderClient.getLastLocation().addOnSuccessListener(this, new OnSuccessListener<Location>() {
                    @Override
                    public void onSuccess(Location location) {
                        updateUIValue(location);
                    }
                });
            } else {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.CAMERA}, PERMISSIONS_MULTIPLY_REQUEST_CODE);
                }
            }
        } catch (Exception exception) {
            Log.d("Permission error",exception.toString());
        }
    }

    private void updateUIValue(Location location) {
        if (location == null)
            return;

        tv_latiency.setText(String.valueOf(location.getLatitude()));
        tv_longitude.setText(String.valueOf(location.getLongitude()));

        if (location.hasSpeed()) {
            tv_speed.setText(String.valueOf(location.getSpeed()));
        } else {
            tv_speed.setText("0.0");
        }

        if (location.hasAltitude()) {
            tv_altitude.setText(String.valueOf(location.getAltitude()));
        } else {
            tv_altitude.setText("0.0");
        }

        geocoder = new Geocoder(MainActivity.this);
        try {
            List<Address> addresses = geocoder.getFromLocation(location.getLatitude(), location.getLongitude(), 1);
            tv_adress.setText(addresses.get(0).getAddressLine(0));
        } catch (Exception e) {
            tv_adress.setText("Ni najdeno");
        }
    }

    //Accelerometer Methods
    @RequiresApi(api = Build.VERSION_CODES.O)
    @Override
    public void onSensorChanged(SensorEvent event) {
        if (mTimerRunning==false) {
            resetTimer();
            startTimer();
        }
        Sensor sensor = event.sensor;
        /*if (sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            tv_accX.setText(String.valueOf(event.values[0]));
            tv_accY.setText(String.valueOf(event.values[1]));
            tv_accZ.setText(String.valueOf(event.values[2]));
            accAlgorithm(event);
        } else if (sensor.getType() == Sensor.TYPE_GYROSCOPE) {
            tv_gyrX.setText(String.valueOf(event.values[0]));
            tv_gyrY.setText(String.valueOf(event.values[1]));
            tv_gyrZ.setText(String.valueOf(event.values[2]));
        }*/
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {

    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private void accAlgorithm(SensorEvent event) {
        float x = event.values[0];
        float y = event.values[1];
        float z = event.values[2];
        lastAcc = currAcc;
        currAcc = (long) Math.sqrt(x * x + y * y + z * z); // / (GRAVITY_EARTH*GRAVITY_EARTH);
        long actualTime = event.timestamp;
        double elapsedTimeInSecond = (double) actualTime / 1_000_000_000;
        //long convert = TimeUnit.MILLISECONDS.convert(actualTime, TimeUnit.NANOSECONDS);
        shake = (long) (shake / GRAVITY_EARTH + (currAcc - lastAcc));
        if (shake > GRAVITY_EARTH) {
            Log.d("Shake", String.valueOf(shake));
            Log.d("Curr", String.valueOf(currAcc));
            Log.d("Time", String.valueOf(elapsedTimeInSecond));
            Toast.makeText(this, "Device was shuffed", Toast.LENGTH_SHORT).show();
            vibrator.vibrate(VibrationEffect.createOneShot((long) (Vibrator_Time_Seconds*1000), DEFAULT_AMPLITUDE));

            if (x > 9 || x < -9) {
                Log.d("X", "X axis is shuffed");
            } else if (y > 9 || y < -9) {
                Log.d("Y", "Y axis is shuffed");
            } else if (z > 9 || z < -9) {
                Log.d("Z", "Z axis is shuffed");
            } else {
                Log.d("Axis", "In multiple axis is shuffed");
            }

            if (mTimerRunning && !tv_speed.equals("")) { //&& !tv_speed.equals("0.0")
                counter++;
                numHoles.add(tv_adress);
                String shakes = String.valueOf(counter) + " shakes";
                Log.d("NumShakes", shakes);
            }
        }
    }

    private void postLocationData(Location location) throws IOException {
        Map<String, String> params = new HashMap<>();

        params.put("uuid", uuid);
        params.put("longitude", String.valueOf(location.getLongitude()));
        params.put("latitude", String.valueOf(location.getLatitude()));
        params.put("speed", String.valueOf(location.getSpeed()));
        params.put("address", geocoder.getFromLocation(location.getLatitude(), location.getLongitude(), 1).get(0).getAddressLine(0));

        new PostAPI().execute("http://192.168.0.28:5000/api/v1/lokacija", getPostDataString(params));
    }

    public static String getPostDataString(Map<String, String> params) throws UnsupportedEncodingException {
        StringBuilder result = new StringBuilder();
        boolean first = true;
        for(Map.Entry<String, String> entry : params.entrySet()){
            if (first)
                first = false;
            else
                result.append("&");

            result.append(URLEncoder.encode(entry.getKey(), "UTF-8"));
            result.append("=");
            result.append(URLEncoder.encode(entry.getValue(), "UTF-8"));
        }

        return result.toString();
    }
    private void startTimer() {
        mCountDownTimer = new CountDownTimer(mTimeLeftInMillis, 10000) {
            @Override
            public void onTick(long millisUntilFinished) {
                mTimeLeftInMillis = millisUntilFinished;
                Log.d("LEFT!!!", String.valueOf(mTimeLeftInMillis));
            }
            @Override
            public void onFinish() {
                mTimerRunning = false;
            }
        }.start();
        mTimerRunning = true;
    }

    private void resetTimer() {
        mTimeLeftInMillis = START_TIME_IN_SECONDS*1000;
        counter=0;
        if(numHoles.size() < 3) {
            tv_condition.setText("Super");
        }
        else if(numHoles.size() < 8) {
            tv_condition.setText("Dobro");

        }
        else if(numHoles.size() >= 8) {
            tv_condition.setText("Slabo");
        }
        numHoles.clear();
    }

}
