<center><h1>Usability</h1></center>

### Important

Since token information is stored in Local storage, in order to log in to multiple accounts on the same device for testing Live Update and Push Notification, please run multiple front-end projects on different ports (e.g., 8080 and 8081) and log in to different accounts.

### 2.1. Register and Login

#### 2.1.1. Login

To login, you need to input a valid email address and a valid password, the input content would be checked immediately after inputting, for invalid input, some prompt would be displayed. The input content would be checked again when submitting.

#### 2.1.2 Register

To login, you need to input a valid email address, a valid name and a valid password (you need to confirm the password as well). The input content would be checked immediately after inputting, for invalid input, some prompt would be displayed. The input content would be checked again when submitting.

#### 2.1.3 Error Popup

The Error Popup will be working as described in the specification.

### 2.2. Basic Feed

#### 2.2.1. Basic Feed

The Basic Feed will be working as described in the specification.

### 2.3. Advanced Feed

#### 2.3.1. Show Likes on a Job

The number of likers would be shown beside the "like/unlike" button, clicking the button will trigger a popup containing the list of all the users who liked this job.

#### 2.3.2. Show Comments on a Job

The number of commenters would be shown beside the comment button, clicking the button will trigger a popup containing the list of all the users who commented on this job and their comments.

#### 2.3.3. Like a Job

After the user likes or unlikes, the button style will change immediately, and the number of likes displayed next to the button will also change instantly.

#### 2.3.4. Feed Pagination

Infinite Scroll implemented, see 2.6.1

### 2.4. Other Users

#### 2.4.1. Viewing others' profiles

Will be working as described in the specification. A link will show how many users are watching this user, clicking the link will trigger a popup containing the name of these users.

You can click the name of a user to go to his/her profile, you can also use /#profile={userId} to view someone's profile (If you know his/her id). If the userId you input does not exist, then you will be led to a not found page.

#### 2.4.2. Viewing your own profile

Will be working as described in the specification. A link will show how many users are watching yourself, clicking the link will trigger a popup containing the name of these users.

You can click MyProfile in the nav bar to go to your profile, you can also use /#profile to view your own profile

#### 2.4.3. Updating your profile

Will be working as described in the specification. In addition, the user's original information will be displayed in the input box. And the image you are using or have uploaded will be displayed at the bottom.

You can also use /#update to update your profile

#### 2.4.4. Watching/Unwatching

Will be working as described in the specification. If you watch/unwatch someone with the watch/unwatch button, the watchees number of that user will be changed immediately.

### 2.5. Adding & Updating Contents

#### 2.5.1. Adding a Job

Will be working as described in the specification.

#### 2.5.2. Updating & Deleting a Job

In your profile, you can click the update button under each job you posted to update that job. The job's original information will be displayed in the input box. And the image you are using or have uploaded will be displayed at the bottom

In your profile, you can click the delete button under each job you posted to delete that job. A popup would be triggered for confirmation. After deleting, the job list would be re-rendered to show the result.

You can use /#update_job=${jobId} to update a job if you know its jobId. If the jobId you input do not exist or if the job is not posted by yourself, you will be routed to a not found page.

#### 2.5.3 Leaving Comments

Will be working as described in the specification. In feed page (main page), click the comment button under a job to leave comment. After leaving a comment, the link indicating the number of comments of that job will change immediately.

### 2.6. Challenge Components

#### 2.6.1. Infinite Scroll

Will be working as described in the specification. For large screen, if the first 5 works loaded are not enough to fill the entire list and trigger the scrollbar, you can click the "More..." link at the end to load subsequent content.

#### 2.6.2. Live Update

Will be working as described in the specification. On feed page, the number of likers and commenters would be live updated. If you are watching name of likers or comments in a popup, the content there would also be live updated.

**Important: The request frequency to the server is once every three seconds, which means you need to wait up to three seconds to see the changes.**

#### 2.6.3. Push Notifications

Will be working as described in the specification. Browser's notification API is used here. You need to grant the permission of sending notifications to the page.

**Important: The request frequency to the server is once every three seconds, which means you need to wait up to three seconds to see the notification. And please make sure that your device allows Chrome to send notifications**

### 2.7. Very Challenge Components

#### 2.7.1. Static feed offline access

Will be working as described in the specification. The most recent jobs (i.e. get by job/feed?start=0) can be displayed even the device is not accessed to the internet (i.e. the backend project is not running). You can only watch the jobs, doing any other operations (liking/unliking, comment, scroll to load more jobs...) will trigger an error popup

#### 2.7.2. Fragment based URL routing

/#login -- Login

/#register -- Register

/#profile -- Watch your profile

/#profile=${userId} -- Watch someone's profile

/#update -- Update your profile

/#addjob -- Post a job

/#update_job=${jobId} -- Update a job

Any other URL would route yourself to the main page.