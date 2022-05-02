import React from 'react'

const Collection = () => {
    const router = useRouter();
    const {collectionId} = router.query;

  return (
    <div>Collection
        
        <div>
            {collectionId} 
            
        </div>
    </div>
  )
}

export default Collection