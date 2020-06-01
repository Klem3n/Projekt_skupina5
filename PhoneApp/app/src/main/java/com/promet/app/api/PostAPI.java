package com.promet.app.api;

import android.os.AsyncTask;

import com.github.kevinsawicki.http.HttpRequest;

import java.io.BufferedOutputStream;
import java.io.BufferedWriter;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;

public class PostAPI extends AsyncTask<String, String, String> {
    @Override
    protected void onPreExecute() {
        super.onPreExecute();
    }

    @Override
    protected String doInBackground(String... params) {
        String urlString = "http://192.168.0.28:5000/api/v1/lokacija"; // URL to call
        String data = params[0]; //data to post

        System.out.println(data);

        try {
            System.out.println(HttpRequest.post(urlString).send(data).code());
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }
}
