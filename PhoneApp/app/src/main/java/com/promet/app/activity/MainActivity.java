package com.promet.app.activity;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationAvailability;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnSuccessListener;
import com.promet.R;

import org.opencv.android.OpenCVLoader;

import java.util.List;

public class MainActivity extends AppCompatActivity {
    //GPS
    public static final int INTERVAL_DEFAULT_TIMER = 10;
    public static final int INTERVAL_FAST_TIMER = 5;
    public static final int PRIORITY_LOCATION_ACCURACY = LocationRequest.PRIORITY_BALANCED_POWER_ACCURACY;
    private static final int PERMISSIONS_FINE_LOCATION = 23;
    TextView tv_latiency;
    TextView tv_longitude;
    TextView tv_altitude;
    TextView tv_accurancy;
    TextView tv_speed;
    TextView tv_sensor;
    TextView tv_adress;
    TextView tv_updates;

    Switch sw_onlocationchange;
    Switch sw_ongpschange;

    FusedLocationProviderClient fusedLocationProviderClient;
    LocationRequest locationRequest;
    Boolean isUpdated=false;
    LocationCallback locationCallBack;

    Geocoder geocoder;


    //OPENCV
    static {
        if(OpenCVLoader.initDebug()){
            Log.d("MainActivity", "OpenCV configured successfully");
        } else {
            Log.d("MainActivity", "OpenCV configuration failed");
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        //GPS
        tv_latiency= findViewById(R.id.tv_lat);
        tv_longitude= findViewById(R.id.tv_lon);
        tv_altitude= findViewById(R.id.tv_altitude);
        tv_accurancy= findViewById(R.id.tv_accuracy);
        tv_speed= findViewById(R.id.tv_speed);
        tv_sensor= findViewById(R.id.tv_sensor);
        tv_adress= findViewById(R.id.tv_sensor);
        tv_updates= findViewById(R.id.tv_address);
        sw_onlocationchange= findViewById(R.id.sw_locationsupdates);
        sw_ongpschange= findViewById(R.id.sw_gps);

        locationRequest = new LocationRequest();
        locationRequest.setInterval(1000 * INTERVAL_DEFAULT_TIMER);
        locationRequest.setFastestInterval(1000 * INTERVAL_FAST_TIMER);
        locationRequest.setPriority(PRIORITY_LOCATION_ACCURACY);

        locationCallBack = new LocationCallback() {

            @Override
            public void onLocationResult(LocationResult locationResult) {
                super.onLocationResult(locationResult);

                updateUIValue(locationResult.getLastLocation());
            }

            @Override
            public void onLocationAvailability(LocationAvailability locationAvailability) {
                super.onLocationAvailability(locationAvailability);
            }
        };

        sw_ongpschange.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick (View v) {
                if (sw_ongpschange.isChecked()) {
                    locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
                    tv_sensor.setText("GPS");
                }
                else {
                    locationRequest.setPriority(PRIORITY_LOCATION_ACCURACY);
                    tv_sensor.setText("Wi-Fi + Towers");
                }
            }
        } );

        sw_onlocationchange.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick (View v) {
                if (sw_ongpschange.isChecked()) {
                    startLocationChanged();

                }
                else {
                    stopLocationChanged();
                }
            }
        } );

        updateGPS();


        //CAMERA
        Button roadCamButton = findViewById(R.id.road_camera_button);

        roadCamButton.setOnClickListener((v)->{
            Intent intent = new Intent(this, RoadCamera.class);
            startActivity(intent);
        });
    }

    private void stopLocationChanged() {
        tv_updates.setText("");
        tv_latiency.setText("");
        tv_longitude.setText("");
        tv_speed.setText("");
        tv_adress.setText("");
        tv_accurancy.setText("");
        tv_altitude.setText("");
        tv_sensor.setText("");

        fusedLocationProviderClient.removeLocationUpdates(locationCallBack);
    }

    private void startLocationChanged() {
        tv_updates.setText("Lokacija se sledi");
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
                        Toast.makeText(this, "Nimate sve dovoljeno", Toast.LENGTH_SHORT).show();
                        finish();
                    }
        }
    }

    private void updateGPS() {
        fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(MainActivity.this);

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fusedLocationProviderClient.getLastLocation().addOnSuccessListener(this, new OnSuccessListener<Location>() {
                @Override
                public void onSuccess(Location location) {
                    updateUIValue(location);


                }
            });
        }
        else {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                requestPermissions(new String [] {Manifest.permission.ACCESS_FINE_LOCATION}, PERMISSIONS_FINE_LOCATION);
            }
        }
    }

    private void updateUIValue(Location location) {
        tv_latiency.setText(String.valueOf(location.getLatitude()));
        tv_longitude.setText(String.valueOf(location.getLongitude()));
        tv_accurancy.setText(String.valueOf(location.getAccuracy()));

        if (location.hasSpeed()) {
            tv_speed.setText(String.valueOf(location.getSpeed()));
        }
        else {
            tv_speed.setText("Ni mogoce");
        }

        if (location.hasAltitude()) {
            tv_altitude.setText(String.valueOf(location.getAltitude()));
        }
        else {
            tv_altitude.setText("Ni mogoce");
        }

        geocoder = new Geocoder(MainActivity.this);
        try {
            List<Address> addresses = geocoder.getFromLocation(location.getLatitude(), location.getLongitude(), 1);
            tv_adress.setText(addresses.get(0).getAddressLine(0));
        }
        catch (Exception e) {
            tv_adress.setText("Nisem našel naslova ");
        }
    }
}