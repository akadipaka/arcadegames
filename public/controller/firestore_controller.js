import { getFirestore ,
    collection, addDoc,
    query, where, orderBy, 
    getDocs, doc, updateDoc,
    deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.9.4/firebase-firestore.js";

const db = getFirestore();

const CommunityFeedCollection ="community_feed";

export async function getAllCommunityfeed(){
    let allCommunityFeeds = [];
    const q = query(collection(db, CommunityFeedCollection), orderBy('timestamp', 'desc'))
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
        let id = doc.id
        let data = doc.data()
        allCommunityFeeds.push({...data, id});
    } )
    return allCommunityFeeds;
}

export async function permanentlyDeleteFeed(feed_id) {
    await deleteDoc(doc(db,CommunityFeedCollection, feed_id))
}

export async function updateExistingFeed(feed_id, updated_data) {
    const docRef = doc(db, CommunityFeedCollection,feed_id);
    await updateDoc(docRef, updated_data);
}

export async function createFeed(community_feed) {
    const doc = await addDoc(collection(db,CommunityFeedCollection), community_feed)
    return await doc.id;
}

const  TicTacToeGameCollection = 'tictactoe_game';
export async function addTicTacToeGameHistory(gameplay){
    //gameplay = {email, winner, moves, timestamp}
    await addDoc(collection(db, TicTacToeGameCollection), gameplay);
}

export async function getTicTacToeGameHistory(email){

    let history =[];
    const q = query(
        collection(db, TicTacToeGameCollection),
        where('email','==',email),
        orderBy('timestamp','desc'),
    );

    const snapShot = await getDocs(q);
    snapShot.forEach(doc =>{
        const {email, winner, moves, timestamp}= doc.data();
        history.push({email, winner, moves, timestamp});
    });
    return history;
}

