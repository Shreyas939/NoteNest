import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import NoteCard from '../../components/Cards/NoteCard';
import { MdAdd } from 'react-icons/md';
import AddEditNotes from './AddEditNotes';
import Modal from 'react-modal';
import moment from "moment"
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../../utils/axiosInstance.js"
import Toast from '../../components/ToastMessage/Toast';
import AddNotesImg from "../../assets/icons/add-note.svg"
import EmptyCard from '../../components/EmptyCard/EmptyCard.jsx';
import NoDataImg from "../../assets/icons/no-data.svg";

const Home = () => {

  const navigate = useNavigate();
  
  // States
  const [userInfo,setUserInfo] = useState(null);
  const [allNotes,setAllNotes] = useState([])
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: 'add',
    data: null,
  });

  const [showToastMsg,setShowToastMsg] = useState({
    isShown: false,
    message:"",
    type:"add"
  })
  
  const [isSearch,setIsSearch] = useState(false)
  

  const handleEdit = (note) => {
    setOpenAddEditModal({
      isShown: true,
      type: 'edit',
      data: note, // Pass the note for editing
    });
  };

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown:false,
      message:"",
    });
  };
  
  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message: message, // Set the passed message
      type: type, // Pass type to indicate nature of the message (success, error, etc.)
    });
  };


  // get user info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');
      if(response.data && response.data.user){
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if(error.response.status===401){
        localStorage.clear()
        navigate("/login")
      }
    }
  };

  // get all notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes")
      
      if(response.data && response.data.notes){
        setAllNotes(response.data.notes);
        console.log(allNotes)
      }
      
    } catch (error) {
      console.log("An unexpected error occurred")
    }
  }
  
  // delete note
  const deleteNote = async (data) => {   
    
    const noteId = data._id
    
    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);
      
      if (response.data && !response.data.error) {
        // Optionally, you can set the updated local state here if needed
        showToastMessage("Note deleted Successfully","delete")
        // It's better to call getAllNotes here because the updated notes will be reflected in the list
        await getAllNotes();
        return; // Early return
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log("An unexpected error occurred")
      }
    }
  };

  // Search for a Note
  const onSearchNote = async (query) => {
    
    try {
      const response = await axiosInstance.get("/search-notes", {
        params:{query},
      })

      if(response.data && response.data.notes){
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(error);
    }
    
  } 

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    
    try {
      const response = await axiosInstance.put("/update-note-pinned/" + noteId, 
        {
          isPinned: !noteData.isPinned
        }
      );
      
      if (response.data && response.data.note) {
        // Optionally, you can set the updated local state here if needed
        showToastMessage("Note updated Successfully")
        // It's better to call getAllNotes here because the updated notes will be reflected in the list
        await getAllNotes();
        
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleClearSearch = () => {
    setIsSearch(false)
    getAllNotes();
  }
  
  

  useEffect(() => {
    getAllNotes()
    getUserInfo();
    return () => {}
  }, [])
  

  return (
    <>
    <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch} />

    <div className='container mx-auto'>
      {allNotes.length > 0 ? (
        <div className='grid grid-cols-3 gap-4 mt-8'>
          {allNotes.map((note, index) => (
            <NoteCard
              key={note._id} // Always provide a unique key
              title={note.title}
              date={new Date(note.createdOn).toLocaleDateString()} // Format date
              content={note.content}
              tags={note.tags.join(", ")} // Join tags as string
              isPinned={note.isPinned}
              onEdit={() => handleEdit(note)}
              onDelete={() => deleteNote(note)}
              onPinNote={() => updateIsPinned(note)}
            />
          ))}
        </div>
      ) : (
      <EmptyCard 
        imgSrc={isSearch ? NoDataImg : AddNotesImg} 
        message={isSearch ? `Oops! No notes found matching your search.` : `Start creating your first note! Click the 'Add' button to jot down your thought,ideas and reminders. Let's get started!`} />
      )}
    </div>


    <button className='absolute flex items-center justify-center w-16 h-16 rounded-2xl bg-primary hover:bg-blue-600 right-10 bottom-10' 
    onClick={() => {
      setOpenAddEditModal({
        isShown: true,
        type: 'add',
        data: null,});
    }}
    >

      <MdAdd className='text-[32px] text-white' />
    </button>

    <Modal
    isOpen={openAddEditModal.isShown}
    onRequestClose={() => {}}
    appElement={document.getElementById('root')}
    style={{
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
      },
      }}
      contentLabel=''
      className='w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll'
      >

    <AddEditNotes 
    type={openAddEditModal.type}
    noteData={openAddEditModal.data}
    onClose={() => {
      setOpenAddEditModal({ isShown: false, type: 'add', data: null});
     }}
     getAllNotes={getAllNotes}
     showToastMessage={showToastMessage}
    />
    </Modal>
    
    <Toast
      isShown={showToastMsg.isShown}
      message={showToastMsg.message}
      type={showToastMsg.type}
      onClose={handleCloseToast}
    />
    </>
  );
};

export default Home