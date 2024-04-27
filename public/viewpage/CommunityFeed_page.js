import { currentUser } from "../controller/firebase_auth.js";
import { createFeed, getAllCommunityfeed, permanentlyDeleteFeed, updateExistingFeed } from "../controller/firestore_controller.js";
import { routePath } from "../controller/route.js";
import { DEV } from "../modal/constants.js";
import * as Elements from "./elements.js";
import { unauthorizedAccess } from "./unauthorized_access.js";
import { info } from "./util.js";

export function addEventListener() {
    Elements.menus.communityfeedpage.addEventListener("click", () => {
        history.pushState(null, null, routePath.COMMUNITYFEEDPAGE);
        communityfeed_page();
    });
}

let community_feeds = [];

let screenElements = {
    create: null,
    tablebody: null,
    formCreate: null,
}

function screenElementsDefination() {
    screenElements.create = document.getElementById('create');
    screenElements.tablebody = document.getElementById('table-body');
    screenElements.formCreate = document.getElementById('form-create');
}

export async function communityfeed_page() {

    if (!currentUser) {
        Elements.root.innerHTML = unauthorizedAccess();
        return;
    }

    const page_response = await fetch('/viewpage/templates/CommunityFeed_page.html', { cache: 'no-store' });
    let html = await page_response.text();

    html += `<div style="padding-top: 15px;">
    <table id="table" class="table table-secondary table-striped">
        <thead><tr><th scope="col">Message</th><th scope="col">Action</th></tr></thead>
        <tbody id="table-body"></tbody>
    </table>
    </div>
    `;

    Elements.root.innerHTML = html;


    try {
        community_feeds = await getAllCommunityfeed();
    } catch (e) {
        if (DEV) {
            console.log('getAllCommunityfeed', e);
        }
    info('getAllCommunityfeed', JSON.stringify(e));
    }
    screenElementsDefination();
    updateScreen();
    buttonEvents();

}

function buttonEvents() {
    screenElements.formCreate.addEventListener("submit", async (e) => {
        e.preventDefault()
        if (e.target.submitter == 'save') {
            const new_feed = {
                timestamp: Date.now(),
                message: e.target.feedmessage.value,
                email: currentUser.email
            }
            try {
                const id = await createFeed(new_feed)
                const feed = { 
                    ...new_feed, 
                    id }
                community_feeds.splice(0, 0, feed)
                updateScreen();
                screenElements.formCreate.style.display = 'none';
                e.target.reset()
                screenElements.create.style.display = 'block';
            } catch (e) {
                if (DEV) console.log('error while creating feed', e);
                Util.info('error while creating feed', JSON.stringify(e));
            }

        } else if (e.target.submitter == 'cancel') {
            screenElements.formCreate.style.display = 'none';
            e.target.reset()
            screenElements.create.style.display = 'block';
        }
    })
    screenElements.create.addEventListener("click", async () => {
        screenElements.formCreate.style.display = 'block';
        screenElements.create.style.display = 'none';
    });
}


function createTableRowForEachFeed(feeds) {
    let rows = ''
    for (let i = 0; i < feeds.length; i++) {
        const feed = feeds[i];
        let row = `<tr>`
        row += `<td>
        <div class="text-white bg-success" style="width:100%">By ${feed.email} (Posted at ${new Date(feed.timestamp).toLocaleString()})</div>
        <div id="feed-${feed.id}"class="text-white bg-secondary" >${feed.message}</div></td>`;
        row += feed.email == currentUser.email 
            ? `<td><button id="feed-edit-${feed.id}" class="btn btn-outline-primary">Edit</button>
                <button id="feed-delete-${feed.id}" class="btn btn-outline-danger">Delete</button>
            </td>`
            : ''
        row +='</tr>'
        rows += row;
    }
    return rows
}

function updateScreen() {
    if (community_feeds == null || community_feeds.length == 0) {
        screenElements.tablebody.innerHTML = `<tr><td colspan="2"><h4>No feeds are posted!</h4></td></tr>`;
    } else {
        screenElements.tablebody.innerHTML = createTableRowForEachFeed(community_feeds);
    }
    // adding button events to all the generated rows for each feed
    let buttons = screenElements.tablebody.getElementsByTagName('button')
    for (const button of buttons) { 
        button.addEventListener('click', async (e) => {
            const splitButtonId = e.target.id.split('-')
            const action = splitButtonId[1]
            const feed_id = splitButtonId[2]
            if (action == "edit") {
                const rowMessage = document.getElementById(`feed-${feed_id}`);
                rowMessage.classList.remove('bg-secondary');
                let feedPos = community_feeds.findIndex(x => x.id == feed_id);
                
                rowMessage.innerHTML = `
                <form id="feed-edit-${feed_id}" method="POST">
                    <textarea name="message" required>${community_feeds[feedPos].message}</textarea>
                    <br>
                    <button type="submit" class="btn btn-outline-danger" onclick="this.form.submitter='update'" >Update</button>
                    <button type="submit" class="btn btn-outline-secondary" formnovalidate onclick="this.form.submitter='cancel'">Cancel</button>
                </form>
                ` ;
                document.getElementById(`feed-edit-${feed_id}`).addEventListener('submit', async (e) => {
                    e.preventDefault()
                    const submitter = e.target.submitter;
                    const timestamp = Date.now()
                    if (submitter == 'update') {
                        let updated_feed = {
                            message: e.target.message.value,
                            timestamp: timestamp
                        }
                        try {
                            await updateExistingFeed(feed_id, updated_feed)
                            let feedPos = community_feeds.findIndex(x => x.id == feed_id);
                            community_feeds[feedPos].message = e.target.message.value
                            community_feeds[feedPos].timestamp = timestamp
                            community_feeds.sort((x,y) => y.timestamp - x.timestamp)
                            updateScreen();
                        } catch (e) {
                            if (DEV) console.log('error while updating the existing record', e);
                            Util.info('error while updating the existing record', JSON.stringify(e));
                        }

                    } else if (submitter == 'cancel') {
                        updateScreen();
                    }
                });
            }
            else if (action == "delete") {
                try {
                    if(confirm('Press OK to permanently delete the feed from Firebase')) {
                        await permanentlyDeleteFeed(feed_id)
                        community_feeds = community_feeds.filter(x => x.id != feed_id);
                        updateScreen();
                    }
                } catch (e) {
                    if (DEV) console.log('error whikle deleting', e);
                    Util.info('error whikle deleting', JSON.stringify(e));
                }
            }
        })
    }
}
