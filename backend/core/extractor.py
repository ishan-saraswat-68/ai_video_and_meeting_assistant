# #Actionable items , decisions , questions these are not for the yt videos these are for the meeting and where we have to take decision on the base of meetinf analysis 

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
import os 


def get_llm():
    return ChatGoogleGenerativeAI(model="gemini-3.8-flash", temperature=0.2)



def build_chain(system_prompt : str):
    llm = get_llm()
    return (
        RunnablePassthrough() | RunnableLambda(lambda x : {"text" : x}) |ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human","{text}"),
    ]) | llm |StrOutputParser()
    )

def extract_action_items(transcript:str)->str:
    chain = build_chain(
         "You are an expert meeting analyst. From the meeting transcript, "
        "extract all action items. For each provide:\n"
        "- Task description\n"
        "- Owner (who is responsible)\n"
        "- Deadline (if mentioned, else write 'Not specified')\n\n"
        "Format as a numbered list. If none found say 'No action items found.'"
    )

    return chain.invoke(transcript)


def extract_key_decisions(transcript: str) -> str:
    chain = build_chain(
        "You are an expert meeting analyst. From the meeting transcript, "
        "extract all key decisions made. Format as a numbered list. "
        "If none found say 'No key decisions found.'"
    )
    return chain.invoke(transcript)


def extract_questions(transcript: str) -> str:
    chain = build_chain(
        "From the meeting transcript, extract all unresolved questions "
        "or topics needing follow-up. Format as a numbered list. "
        "If none found say 'No open questions found.'"
    )
    return chain.invoke(transcript)







#------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

#             BELOW IS THE UPGRADED VERSION OF THE code THAT WORKS WELL FOR THE LONG MEETINGS WITH THE HELP OF SMALL CHUNKS AND LLMS. WHERE WE PROVIED THE SAME SYSTEM PROMPT BUT IT WORKED WELL FOR THE LONGER MEETINGS AND NOW THIS MUCH MORE ACCURATE 

#------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




# #Actionable items , decisions , questions these are not for the yt videos these are for the meeting and where we have to take decision on the base of meetinf analysis 

# from langchain_mistralai import ChatMistralAI
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.output_parsers import StrOutputParser
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_core.runnables import RunnablePassthrough, RunnableLambda
# import os 

# def get_llm():
#     return ChatMistralAI(model = "mistral-small-latest", mistral_api_key = os.getenv("MISTRAL_API_KEY"),temperature=0.2)

# def split_transcript(transcript: str):
#     splitter = RecursiveCharacterTextSplitter(
#         chunk_size=3000,
#         chunk_overlap=200,
#     )
#     return splitter.split_text(transcript)

# def build_chain(system_prompt : str):
#     llm = get_llm()
#     return (
#         RunnablePassthrough() | RunnableLambda(lambda x : {"text" : x}) |ChatPromptTemplate.from_messages([
#                 ("system", system_prompt),
#                 ("human", "{text}"),
#             ]
#         ) 
#         | llm 
#         | StrOutputParser()
#     )

# # new function to extract the chunks
# def extract_from_chunks(transcript: str, map_prompt: str, combined_prompt: str ):
#     """
#     This function is used to extract the information from the chunks of the transcript.
#     basically creates different chains and then combine them to create a final result. 
#     """

#     map_chain = build_chain(map_prompt)
    
#     chunks = split_transcript(transcript)
    
#     partial_results = [map_chain.invoke(chunk) for chunk in chunks]
    
#     combined = "\n\n".join(partial_results)
    
#     reduced_chain = build_chain(combined_prompt)
    
#     return reduced_chain.invoke(combined)


# # extract action items
# def extract_action_items(transcript: str):
#     return extract_from_chunks(
#         transcript,
#         map_prompt="""
#             Extract all action items from this portion of the meeting.

#             For each action item provide:
#             - Task
#             - Owner (if mentioned)
#             - Deadline (if mentioned else 'Not specified')

#             If none exist, return:
#             No action items found.
#             """,
#         combine_prompt="""
#             These action items were extracted from overlapping transcript chunks.

#             Merge duplicate action items created because of chunk overlap.

#             Keep every unique action item.

#             Preserve owners and deadlines whenever available.

#             Return a clean numbered list.

#             If none exist, return:
#             No action items found.
#             """,
#     )

# # extract key decisions
# def extract_key_decisions(transcript: str):
#     return extract_from_chunks(
#         transcript,
#         map_prompt="""
#             Extract all key decisions made in this portion of the meeting.

#             Return a numbered list.

#             If none exist return:
#             No key decisions found.
#         """,
#         combine_prompt="""
#             These decisions were extracted from overlapping transcript chunks.

#             Merge duplicate or similar decisions while preserving all unique decisions.

#             Return a clean numbered list.

#             If none exist return:
#             No key decisions found.
#             """,
#     )

# # extract questions
# def extract_questions(transcript: str):
#     return extract_from_chunks(
#         transcript,
#         map_prompt="""
#             Extract all unresolved questions or follow-up topics from this portion of the meeting.

#             Return a numbered list.

#             If none exist return:
#             No open questions found.
#         """,
#         combine_prompt="""
#             These questions were extracted from overlapping transcript chunks.

#             Merge duplicate questions caused by chunk overlap.

#             Keep every unique unresolved question.

#             Return a clean numbered list.

#             If none exist return:
#             No open questions found.
#         """,
#     )