/**
 * Created by SherlockZhong on 6/26/15.
 */

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.*;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.codehaus.jettison.json.JSONObject;
import org.junit.runner.Result;

public class Processor {

    private static int count;

    private static Connection connection = null;

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
                save(result);
                context.write(new Text(result.toString()), null);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private static void save(JSONObject jsonObject) {
        String id, title, author, institute,journal, issue, abs, link;
        id = title = author = institute = journal = issue = abs = link = "";
        try {
            id = jsonObject.getString("id");
            title = jsonObject.getString("title");
            author = jsonObject.has("author") ? jsonObject.getString("author") : "null";
            institute = jsonObject.has("institute") ? jsonObject.getString("institute") : "null";
            journal = jsonObject.has("journal") ? jsonObject.getString("journal") : "null";
            issue = jsonObject.has("issue") ? jsonObject.getString("issue") : "null";
            abs = jsonObject.has("abstract") ? jsonObject.getString("abstract") : "null";
            link = jsonObject.has("link") ? jsonObject.getString("link") : "null";
        } catch (Exception e) {
//            e.printStackTrace();
        }

        // save author & journal info * institute info
        try {
            PreparedStatement psAuthor = connection.prepareStatement("insert into author (author_name) values(?)");
            psAuthor.setString(1, author);
            update(psAuthor);

            PreparedStatement psJournal = connection.prepareStatement("insert into journal (journal_name) values(?)");
            psJournal.setString(1, journal);
            update(psJournal);

            PreparedStatement psInstitute = connection.prepareStatement("insert into institute (institute_name) values(?)");
            psInstitute.setString(1, institute);
            update(psInstitute);
        } catch (Exception e) {
//            e.printStackTrace();
        }

        // get author & journal id & institute id
        int authorId = -1;
        int journalId = -1;
        int instituteId = -1;
        try {
            ResultSet rsAuthor = query(connection.prepareStatement("select author_id from author where author_name=\"" + author + "\""));
            while (rsAuthor.next()) {
                authorId = rsAuthor.getInt(1);
            }

            ResultSet rsJournal = query(connection.prepareStatement("select journal_id from journal where journal_name=\"" + journal + "\""));
            while (rsJournal.next()) {
                journalId = rsJournal.getInt(1);
            }

            ResultSet rsInstitute = query(connection.prepareStatement("select institute_id from institute where institute_name=\"" + institute + "\""));
            while (rsInstitute.next()) {
                instituteId = rsInstitute.getInt(1);
            }
        } catch (Exception e) {
//            e.printStackTrace();
        }

        // save article
        try {
            String sqlArticle = "insert into article (id, title, abstract, link, issue, author_id, journal_id, institute_id) values(?, ?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement psArticle = connection.prepareStatement(sqlArticle);
            psArticle.setString(1, id);
            psArticle.setString(2, title);
            psArticle.setString(3, abs);
            psArticle.setString(4, link);
            psArticle.setString(5, issue);
            psArticle.setInt(6, authorId);
            psArticle.setInt(7, journalId);
            psArticle.setInt(8, instituteId);
            update(psArticle);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void connect() {
        String url = "jdbc:mysql://localhost:3306/ThesisEngine";
        String name = "com.mysql.jdbc.Driver";
        String user = "root";
        String password = "root";

        try {
            Class.forName(name);
            connection = DriverManager.getConnection(url, user, password);
            System.out.println("***** MySQL Connected");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void close() {
        try {
            connection.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static int update(PreparedStatement preparedStatement) {
        if (connection != null) {
            try {
                return preparedStatement.executeUpdate();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return 0;
    }

    private static ResultSet query(PreparedStatement preparedStatement) {
        if (connection != null) {
            try {
                return preparedStatement.executeQuery();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return null;
    }

    public static void main(String[] args) throws Exception{
        long start = new Date().getTime();

        connect();

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

        close();

        System.exit(0);
    }

}
