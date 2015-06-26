/**
 * Created by SherlockZhong on 6/26/15.
 */

import java.io.IOException;
import java.util.*;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.util.GenericOptionsParser;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.mortbay.util.ajax.JSON;

public class Processor {

    private static int count;

    private static class Map extends Mapper<Object, Text, Text, Text> {
        @Override
        protected void map(Object key, Text value, Context context) throws IOException, InterruptedException {
            String input = value.toString();
            try {
                JSONObject jsonObject = new JSONObject(input);
                String id = jsonObject.getString("_id");
                String title = jsonObject.getString("title");
                String author = jsonObject.has("author") ? jsonObject.getString("author") : "null";
                String institute = jsonObject.has("institute") ? jsonObject.getString("institute") : "null";
                String journal = jsonObject.has("journal") ? jsonObject.getString("journal") : "null";
                String issue = jsonObject.has("issue") ? jsonObject.getString("issue") : "null";
                String abs = jsonObject.has("abstract") ? jsonObject.getString("abstract") : "null";
                String link = jsonObject.has("link") ? jsonObject.getString("link") : "null";
                context.write(new Text(title), new Text("id_" + id));
                context.write(new Text(title), new Text("author_" + author));
                context.write(new Text(title), new Text("institute_" + institute));
                context.write(new Text(title), new Text("journal_" + journal));
                context.write(new Text(title), new Text("issue_" + issue));
                context.write(new Text(title), new Text("abstract_" + abs));
                context.write(new Text(title), new Text("link_" + link));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private static class Reduce extends Reducer<Text, Text, Text, Text> {
        @Override
        protected void reduce(Text key, Iterable<Text> values, Context context) throws IOException, InterruptedException {
            count++;
            try {
                JSONObject result = new JSONObject();
                result.put("title", key.toString());
                Iterator iterator = values.iterator();
                while (iterator.hasNext()) {
                    String value = iterator.next().toString();
                    String[] parts = value.split("_");
                    String k = parts[0];
                    String v = "";
                    for (int i = 1; i < parts.length; i++) {
                        v += parts[i];
                    }
                    if (!v.equalsIgnoreCase("null") && !result.has(k)) {
                        result.put(k, v);
                    }
                }
                context.write(new Text(result.toString()), null);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) throws Exception{
        long start = new Date().getTime();

        String input = "input/cnki.txt";
        String output = "output/";

        Configuration configuration = new Configuration();
        Job job = new Job(configuration, "Processor");
        job.setJarByClass(Processor.class);
        job.setMapperClass(Map.class);
        job.setReducerClass(Reduce.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(Text.class);
        FileInputFormat.addInputPath(job, new Path(input));
        FileOutputFormat.setOutputPath(job, new Path(output));
        job.waitForCompletion(true);

        long end = new Date().getTime();
        System.out.println("***** Finished, Total Time: " + (end - start));
        System.out.println("***** Total Items Count: " + count);
        System.exit(0);
    }

}
